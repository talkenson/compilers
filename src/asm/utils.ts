export function createAsciiTable(data: string) {
  const processedData = data
    .split(/\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length)
    .filter((s) => !s.startsWith('//'))
    .map((row) => row.split(/\s+/).filter((s) => s.trim()))
  console.log(processedData)
  let result = ''

  // Get the maximum length of each column
  const columnLengths = Array(5)
    .fill(0)
    .map((_, i) =>
      Math.max(
        5,
        ...processedData.map((row) =>
          (row[i] ?? '').startsWith('$') ? 0 : (row[i] ?? '').length
        )
      )
    )

  // Loop through each row and column to create the table
  processedData.forEach((row) => {
    row.forEach((cell, i) => {
      // Pad each cell with spaces to match the maximum length of its column
      result += cell.padEnd(columnLengths[i] + 1, ' ')
    })
    result += '\n'
  })

  return result
}
