const areTestCasesValid = (testCases) => {
  const { count, input, output } = testCases,
    splitedOnput = input.split(",\r\n"),
    splitedOutput = output.split(",\r\n"),
    inputLength = splitedOnput.length,
    outputLength = splitedOutput.length;
  return count === inputLength && count === outputLength;
};

const getUpdatedTestCases = (newTestCases, oldTestCases) => { 
  return {
    count: !newTestCases
      ? oldTestCases.count
      : oldTestCases.count + newTestCases.count,
    input:
      newTestCases && newTestCases.input !== undefined
        ? `${oldTestCases.input}\r\n${newTestCases.input.replaceAll(
            ",\r\n",
            "\r\n"
          )}`
        : oldTestCases.input,
    output:
      newTestCases && newTestCases.output !== undefined
        ? `${oldTestCases.output}\r\n${newTestCases.output.replaceAll(
            ",\r\n",
            "\r\n"
          )}`
        : oldTestCases.output,
  };
};

module.exports = {
  areTestCasesValid,
  getUpdatedTestCases
};
