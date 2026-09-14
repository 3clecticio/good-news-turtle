#!/usr/bin/env python3
"""
build_desktop_app.py — Package the Good News Turtle web app as a downloadable
Electron desktop app.

Requires:
  - Python 3.9+ (standard library only)
  - Node.js + npm installed on the system
  - A copy of the Good News Turtle project

Usage:
  python build_desktop_app.py --project-dir /path/to/good-news-turtle \
                              --output-dir /where/to/put/archive
"""

import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

APP_NAME = "Good News Turtle"
APP_URL = "https://goodnewsturtle.com"


def parse_args():
    parser = argparse.ArgumentParser(
        description="Build the Good News Turtle desktop app"
    )
    parser.add_argument(
        "--project-dir",
        default=".",
        help="Path to the Good News Turtle project root",
    )
    parser.add_argument(
        "--output-dir",
        default=".",
        help="Directory where the packaged archive will be saved",
    )
    parser.add_argument(
        "--platform",
        default="current",
        choices=["current", "linux", "win32", "darwin"],
        help="Target platform",
    )
    return parser.parse_args()


def run(cmd, cwd, check=True):
    print(f"Running: {' '.join(cmd)} (in {cwd})")
    subprocess.run(cmd, cwd=cwd, check=check)


def ensure_node():
    if shutil.which("node") is None or shutil.which("npm") is None:
        print("ERROR: Node.js and npm are required. Install from https://nodejs.org/")
        sys.exit(1)


def update_package_json(project_dir: Path):
    pkg_path = project_dir / "package.json"
    if not pkg_path.exists():
        print(f"ERROR: No package.json found in {project_dir}")
        sys.exit(1)

    with pkg_path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    data["name"] = "good-news-turtle"
    data["main"] = "electron/main.cjs"
    data["description"] = "Good News Turtle — a hub of positive, life-affirming news and community."
    data["author"] = "Good News Turtle"

    with pkg_path.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
        f.write("\n")

    print(f"Updated {pkg_path}")


def write_electron_files(project_dir: Path):
    electron_dir = project_dir / "electron"
    electron_dir.mkdir(exist_ok=True)
    main_cjs = electron_dir / "main.cjs"

    template = f"""\
const {{ app, BrowserWindow, shell, nativeImage }} = require('electron');
const path = require('path');

const APP_URL = '{APP_URL}';
const ICON_PATH = path.join(__dirname, '..', 'public', 'favicon.ico');

let mainWindow;

function createWindow() {{
  let icon;
  try {{
    icon = nativeImage.createFromPath(ICON_PATH);
  }} catch (e) {{
    console.warn('Could not load icon:', e.message);
  }}

  mainWindow = new BrowserWindow({{
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: '{APP_NAME}',
    icon: icon || undefined,
    autoHideMenuBar: true,
    webPreferences: {{
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
    }},
  }});

  mainWindow.loadURL(APP_URL);

  // Open external links in the default system browser
  mainWindow.webContents.setWindowOpenHandler(({{ url }}) => {{
    shell.openExternal(url);
    return {{ action: 'deny' }};
  }});

  mainWindow.webContents.on('will-navigate', (event, url) => {{
    try {{
      const parsedUrl = new URL(url);
      const appOrigin = new URL(APP_URL).origin;
      if (parsedUrl.origin !== appOrigin) {{
        event.preventDefault();
        shell.openExternal(url);
      }}
    }} catch (e) {{
      // malformed URL, ignore
    }}
  }});

  mainWindow.on('closed', () => {{
    mainWindow = null;
  }});
}}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {{
  if (process.platform !== 'darwin') app.quit();
}});

app.on('activate', () => {{
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
}});
"""
    main_cjs.write_text(template, encoding="utf-8")
    print(f"Created {main_cjs}")


def install_deps(project_dir: Path):
    run(
        [
            "npm",
            "install",
            "--save-dev",
            "--legacy-peer-deps",
            "electron",
            "@electron/packager",
        ],
        cwd=project_dir,
    )


def package_app(project_dir: Path, platform: str):
    release_dir = project_dir / "electron-release"
    if release_dir.exists():
        shutil.rmtree(release_dir)
    release_dir.mkdir(parents=True, exist_ok=True)

    platform_flag = sys.platform if platform == "current" else platform

    cmd = [
        "npx",
        "@electron/packager",
        ".",
        APP_NAME,
        f"--platform={platform_flag}",
        "--arch=x64",
        "--out=electron-release",
        "--overwrite",
        "--ignore=node_modules",
        "--ignore=^/src",
        "--ignore=^/electron-release",
    ]
    run(cmd, cwd=project_dir)


def archive_output(project_dir: Path, output_dir: Path, platform: str):
    release_dir = project_dir / "electron-release"
    builds = list(release_dir.glob(f"{APP_NAME}-*"))
    if not builds:
        print("No packaged build found.")
        return None

    output_dir.mkdir(parents=True, exist_ok=True)
    archives = []

    for build in builds:
        target_name = build.name

        if platform == "win32":
            archive_path = output_dir / f"{target_name}.zip"
            run(
                [
                    "powershell",
                    "Compress-Archive",
                    "-Path",
                    target_name,
                    "-DestinationPath",
                    str(archive_path),
                ],
                cwd=release_dir,
            )
        else:
            archive_path = output_dir / f"{target_name}.tar.gz"
            run(
                [
                    "tar",
                    "czf",
                    str(archive_path),
                    "-C",
                    str(release_dir),
                    target_name,
                ],
                cwd=release_dir,
            )

        archives.append(archive_path)
        print(f"Created {archive_path}")

    # Remove the unpackaged build directory so it does not get committed.
    shutil.rmtree(release_dir, ignore_errors=True)
    print(f"Cleaned up {release_dir}")

    return archives


def main():
    args = parse_args()
    project_dir = Path(args.project_dir).resolve()
    output_dir = Path(args.output_dir).resolve()

    platform = args.platform
    if platform == "current":
        platform = sys.platform

    print(f"Project dir: {project_dir}")
    print(f"Output dir: {output_dir}")
    print(f"Target platform: {platform}")

    ensure_node()
    update_package_json(project_dir)
    write_electron_files(project_dir)
    install_deps(project_dir)
    package_app(project_dir, platform)
    archive_output(project_dir, output_dir, platform)

    print("Done!")


if __name__ == "__main__":
    main()
