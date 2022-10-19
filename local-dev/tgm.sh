#!/bin/bash
f="$1"
overwrite="-n"
files=$f
[[ -z "$f" ]] && files=./*.tar
for f in $files; do
    echo $f;
    d="${f%.tar}.frames";
    mkdir "${d}" && tar -xf "${f}" -C "${d}"
    ffmpeg $overwrite -framerate 30 -f image2 -i "${d}/%07d.png" -c:v libvpx-vp9 -pix_fmt yuva420p -vf scale=512:-1 "${f%.tar}.webm"
    ffmpeg $overwrite -framerate 30 -f image2 -i "${d}/%07d.png" -c:v libvpx-vp9 -pix_fmt yuva420p -vf scale=100:-1 "${f%.tar}_emoji.webm"
done;