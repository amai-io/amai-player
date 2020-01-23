// Seconds converted to time format
export default function formatTime(second) {
  let i = 0;
  let h = 0;
  let s = parseInt(second);
  if (s > 60) {
    i = parseInt(s / 60);
    s = parseInt(s % 60);
    if (i > 60) {
      h = parseInt(i / 60);
      i = parseInt(i % 60);
    }
  }
  // Zero padding
  // eslint-disable-next-line no-undef
  const zero = v => (v >> 0 < 10 ? `0${v}` : v);
  if (h > 0) return [zero(h), zero(i), zero(s)].join(':');
  return [zero(i), zero(s)].join(':');
}
