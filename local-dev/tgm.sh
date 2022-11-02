#!/bin/bash
f="$1"
overwrite_flag="-n"
files=$f
[[ -z "$f" ]] && files=./*.tar
for f in $files; do
    echo $f;
    d="${f%.tar}.frames";
    mkdir "${d}" && tar -xf "${f}" -C "${d}"
    output_file="${f%.tar}.webm"
    [[ -f "$output_file" && "$overwrite_flag" == "-n" ]] || ffmpeg $overwrite_flag -framerate 30 -f image2 -i "${d}/%07d.png" -c:v libvpx-vp9 -b:v 750k -pix_fmt yuva420p -vf scale=512:-1 "$output_file"
    output_file="${f%.tar}_emoji.webm"
    [[ -f "$output_file" && "$overwrite_flag" == "-n" ]] || ffmpeg $overwrite_flag -framerate 30 -f image2 -i "${d}/%07d.png" -c:v libvpx-vp9 -pix_fmt yuva420p -vf scale=100:-1 "$output_file"
done;