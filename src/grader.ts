import fs from 'fs';
import path from 'path';

export interface GradingMessage {
  name: string;
  hint?: string;
  success?: boolean; // For public tests
}

export class Grader {
  rubrics: Map<string, GradingMessage[]> = new Map();

  addEntry(rubricName: string, entry: GradingMessage): void {
    if (!this.rubrics.has(rubricName)) {
      this.rubrics.set(rubricName, []);
    }
    this.rubrics.get(rubricName)!.push(entry);
  }

  getPerformance(): { percent?: number; success?: number } {

    const successes = [...this.rubrics.values()]
      .flatMap(v => v.filter(entry => entry.success === true).length)
      .reduce((prev, current) => prev + current, 0);

    const totalTests = [...this.rubrics.values()]
      .flatMap(v => v.length)
      .reduce((prev, current) => prev + current, 0);

    return {
      success: totalTests ? (successes / totalTests) * 100 : undefined,
    };
  }

  reset() {
    this.rubrics.clear();
  }
}

export function GradedTest(ctx: {
  exerciseNumber: number;
  rubricName: string;
  testCaseName: string;
  hintOnFailure?: string;
  testCase: () => void;
  resultsFile: string;
}) {
  test(ctx.testCaseName, () => {
    const grader = new Grader(); // Create a new grader for each test

    try {
      ctx.testCase();
      grader.addEntry(ctx.rubricName, {
        name: ctx.testCaseName,
        success: true,
      });
    } catch (error) {
      grader.addEntry(ctx.rubricName, {
        name: ctx.testCaseName,
        hint: ctx.hintOnFailure,
        success: false,
      });
      throw error; // Rethrow the error to ensure the test fails correctly
    } finally {
      // Write the results to a file
      const results = grader.getPerformance();
      const resultEntry = {
        rubric: ctx.rubricName,
        test: ctx.testCaseName,
        success: results.success,
      };
      // Append the result to the results file
      appendResultToFile(ctx.resultsFile, resultEntry);
    }
  });
}

function appendResultToFile(filePath: string, result: any) {
  let resultsArray = [];

  // Check if the file exists
  if (fs.existsSync(filePath)) {
    // Read existing results
    const data = fs.readFileSync(filePath, 'utf-8');
    try {
      resultsArray = JSON.parse(data);
    } catch {
      // If parsing fails, start with an empty array
      resultsArray = [];
    }
  }

  // Append the new result
  resultsArray.push(result);

  // Write the updated array back to the file
  fs.writeFileSync(filePath, JSON.stringify(resultsArray, null, 2));
}
