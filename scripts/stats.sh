#!/usr/bin/env bash

# Outputs some interesting stats about the Lacuna client code.
# Ensure you have `ack` and `cloc` installed.
# Usage: (from project root) scripts/stats.sh

function count_mentions {
    ack $1 app/js/ --count --no-filename
}

echo Mentions of 'YAHOO': $(count_mentions YAHOO)
echo Number of React Components: $(count_mentions React.createClass)

echo

cloc app/ --quiet --read-lang-def scripts/custom-cloc-lang-definitions.txt
