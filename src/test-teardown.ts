import fs from 'fs';
import path from 'path';

// Define the directory where the results files are located
const resultsDir = path.resolve(__dirname, 'results');

// Function to read JSON data from a file
const readJsonFile = (filePath: string): any[] => {
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
};

// Function to calculate the average success percentage
const calculateAverageSuccess = (data: any[]): number => {
  const totalSuccess = data.reduce((acc, item) => acc + item.success, 0);
  return data.length > 0 ? totalSuccess / data.length : 0;
};

// Main function to process all result files and calculate averages
const calculateAverages = () => {
  const averages: Record<string, number> = {};

  // Process each file for ex1 to ex6
  for (let i = 1; i <= 6; i++) {
    const fileName = `results_ex${i}.json`;
    const filePath = path.join(resultsDir, fileName);
    
    if (fs.existsSync(filePath)) {
      const data = readJsonFile(filePath);
      const averageSuccess = calculateAverageSuccess(data);
      averages[`ex${i}`] = averageSuccess;
    } else {
      console.warn(`File not found: ${filePath}`);
      averages[`ex${i}`] = 0;
    }
  }

  // Log the results
  console.log('Average success percentages per test:');
  for (const [key, value] of Object.entries(averages)) {
    console.log(`${key}: ${value.toFixed(2)}%`);
  }

  for (const [key, value] of Object.entries(averages)) {
    addActionOutput(key, value + " %");
  }
  
};

export function addActionOutput(exNumber: string, value: string): void {
  const key = `score_${exNumber}`;

  // Check if GITHUB_OUTPUT environment variable is set
  if (process.env.GITHUB_OUTPUT) {
      const outputPath = process.env.GITHUB_OUTPUT;
      if (outputPath) {
          fs.appendFileSync(outputPath, `${key}=${value}\n`);
      }
  } else {
      // In case GITHUB_OUTPUT is not set, use the GitHub Actions command
      console.log(`::set-output name=${key}::${value}`);
  }
}

export default async function globalTeardown() {
  calculateAverages()
}
