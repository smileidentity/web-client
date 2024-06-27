#!/bin/bash

# Fetch the latest changes and update the local info
git fetch --all

# Initialize an empty array for PR numbers
declare -a pr_numbers

# List all open pull requests and store them in an array
while IFS= read -r line; do
    pr_numbers+=("$line")
done < <(gh pr list --state open --json number --jq '.[].number')

# Loop through all PR numbers
for pr_number in "${pr_numbers[@]}"
do
    echo "Processing PR #$pr_number..."

    # Check out the pull request by number
    gh pr checkout $pr_number

    # Create an empty commit
    git commit --allow-empty -m "Trigger CI for PR #$pr_number"

    # Push the commit
    git push

    echo "CI triggered for PR #$pr_number"
done

echo "All open PRs have been processed."
