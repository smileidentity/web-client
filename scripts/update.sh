#!/bin/bash

# This script automates the process of updating Node.js package dependencies.
# It searches for all package.json files in the repository (excluding the root),
# navigates to each directory, and updates the dependencies using 'npm-check-updates' (ncu).
# It then checks if there's a package.json in the root directory and updates it last.

# List of dependencies to ignore
ignore_dependencies=(
    "@storybook/addon-essentials"
    "@storybook/addon-links"
    "@storybook/blocks"
    "@storybook/web-components-vite"
    "@storybook/web-components"
    "eslint"
    "signature_pad"
    "storybook"
)

# Convert the list to a comma-separated string
ignore_list=$(printf ",%s" "${ignore_dependencies[@]}")
ignore_list=${ignore_list:1} # remove the leading comma

# Get all package.json locations excluding the root
package_locations=$(git ls-files '**/package.json')

# Save the current directory
root_path=$(pwd)

# Function to update dependencies using ncu
update_dependencies() {
    local package_dir=$1
    echo "Updating dependencies for $package_dir"

    # Navigate to the package directory
    cd "$package_dir" || {
        echo "Failure to navigate to $package_dir"
        exit 1
    }

    # Update the package using ncu, ignoring specified dependencies
    ncu -u --reject "$ignore_list" || {
        echo "Failure to update dependencies for $package_dir"
        exit 1
    }

    # Return to the root path
    cd "$root_path" || {
        echo "Failure to navigate back to root path"
        exit 1
    }
}

# Check if npm-check-updates is installed globally, install if not
if ! npm list -g npm-check-updates >/dev/null; then
    echo "npm-check-updates is not installed globally. Installing now..."
    npm install -g npm-check-updates
fi

# Update subdirectory packages first
for location in $package_locations; do
    dir=$(dirname "$location")
    if [ "$dir" != "." ]; then # Exclude root directory
        update_dependencies "$dir"
    fi
done

# Check if there is a package.json in the root
if [ -f "$root_path/package.json" ]; then
    update_dependencies "$root_path"
fi

# Install the updated packages
npm install

echo "All packages have been updated."
