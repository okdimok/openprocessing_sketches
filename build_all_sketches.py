#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path


def build_all_sketches(size: int = 300, output: str = "all_sketches.html") -> None:
    sketches_dir = Path(__file__).resolve().parent
    root = sketches_dir.parent
    skip = {".git", "local-dev"}

    dirs = sorted(
        d
        for d in sketches_dir.iterdir()
        if d.is_dir() and d.name not in skip and (d / "index.html").exists()
    )

    iframe_lines = [
        f'    <iframe src="openprocessing_sketches/{d.name}/index.html#sz={size}" scrolling=no></iframe>'
        for d in dirs
    ]

    html = "\n".join(
        [
            "<!DOCTYPE html>",
            '<html lang="en">',
            "<head>",
            '<link rel="stylesheet" href="all_sketches.css">',
            "</head>",
            "<body>",
            *iframe_lines,
            "</body>",
            "</html>",
            "",
        ]
    )

    (root / output).write_text(html, encoding="utf-8")


if __name__ == "__main__":
    build_all_sketches()
