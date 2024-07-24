import { Grader } from "./grader";

export default async function globalSetup() {
  global.grader = new Grader();  // Ensure this line is reached
}