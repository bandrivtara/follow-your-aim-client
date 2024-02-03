const compareTime = (a: any, b: any) => {
  const timeA = a.details.startTime || [24, 0];
  const timeB = b.details.startTime || [24, 0];

  // Compare hours
  if (timeA[0] !== timeB[0]) {
    return timeA[0] - timeB[0];
  }

  // If hours are the same, compare minutes
  return timeA[1] - timeB[1];
};

export default compareTime;
