#!/bin/bash
f="$1"
files=$f
[[ -z "$f" ]] && files=./*.tar
echo $files
for f in $files; do
    echo $f;
    d="${f%.tar}.frames";
    mkdir -p "${d}"
    tar -xf "${f}" -C "${d}"
    ffmpeg -y -framerate 30 -f image2 -i "${d}/%07d.png" -c:v libvpx-vp9 -pix_fmt yuva420p -vf scale=512:-1 "${f%.tar}.webm"
done;