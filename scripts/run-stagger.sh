#!/usr/bin/env bash
files=($(echo ../inputs/swe/txt/*.txt))

if test -f ${files[0]}
then
  start=$(date +%s.%N)
  echo "Converting: ${files[*]}"
  java -Xmx2G -jar ../vendor/stagger/stagger.jar -modelfile ../assets/big/swedish.bin -tag ${files[*]}
  echo "Done"
  echo "Moving generated files to output directories"
  mv ${files[*]} ../inputs/swe/txt-out
  echo "Done"
  mv ../inputs/swe/txt/*.conll ../inputs/swe/conll
  end=$(date +%s.%N)
  diff=$(echo "$end - $start" | bc)
  echo "Time to execute: $diff"
else
  echo "No files to convert"
fi
