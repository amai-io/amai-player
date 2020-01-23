export default function createRandomNum(minNum, maxNum) {
  return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
}
