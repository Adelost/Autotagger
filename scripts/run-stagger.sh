#!/usr/bin/env bash
files=../inputs/swe/txt/*.txt
java -Xmx2G -jar ../vendor/stagger/stagger.jar -modelfile ../vendor/stagger/models/swedish.bin -tag $files
mv $files ../inputs/swe/txt-out
mv ../inputs/swe/txt/*.conll ../inputs/swe/conll
