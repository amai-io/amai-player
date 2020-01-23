export default function distinct(array) {
  return array
    .map(item => JSON.stringify(item))
    .filter((item, idx, arry) => idx === arry.indexOf(item))
    .map(item => JSON.parse(item));
}
