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
    bv="-b:v 300k"
    # [[ -f "$output_file" && "$overwrite_flag" == "-n" ]] || ffmpeg $overwrite_flag -framerate 30 -f image2 -i "${d}/%07d.png" -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 200k -vf scale=512:-1 "$output_file"
    [[ -f "$output_file" && "$overwrite_flag" == "-n" ]] || \
        ffmpeg $overwrite_flag -framerate 30 -f image2 -i "${d}/%07d.png" -c:v libvpx-vp9 -pix_fmt yuva420p $bv -pass 1 -vf scale=512:-1 -an -f null /dev/null && \
        ffmpeg $overwrite_flag -framerate 30 -f image2 -i "${d}/%07d.png" -c:v libvpx-vp9 -pix_fmt yuva420p $bv -pass 2 -vf scale=512:-1 "$output_file"
    output_file="${f%.tar}_emoji.webm"
    [[ -f "$output_file" && "$overwrite_flag" == "-n" ]] || ffmpeg $overwrite_flag -framerate 30 -f image2 -i "${d}/%07d.png" -c:v libvpx-vp9 -pix_fmt yuva420p -vf scale=100:-1 "$output_file"
done;