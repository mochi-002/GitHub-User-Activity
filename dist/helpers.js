import chalk from "chalk";
/**
 * Prints CLI usage instructions to the terminal.
 * Shown when the user runs the tool with no arguments (or bad ones).
 */
function printUsage() {
    console.log(`
${chalk.bold("Usage:")}

  ${chalk.cyan("CLI")}  : ${chalk.green("github-activity")} <username>
  ${chalk.cyan("CLI")}  : ${chalk.green("github-activity")} <username${chalk.red("1")}> <username${chalk.red("2")}> <username${chalk.red("...")}>
  ${chalk.cyan("FILE")} : ${chalk.green("github-activity")} <username> ${chalk.yellow("--output")} <filename.txt>
`);
}
export { printUsage };
