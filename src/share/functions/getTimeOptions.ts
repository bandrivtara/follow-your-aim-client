export const getTimeOptions = (step: number) => {
  const hours = 24;
  const options = [];
  const minutes = [];
  for (let i = 0; i <= 60; i += step) {
    const formattedValue = i < 10 ? `0${i}` : `${i}`;
    minutes.push(formattedValue);
  }

  for (let hour = 0; hour < hours; hour++) {
    const hoverObject = {
      value: hour.toString(),
      label: hour.toString(),
      children: minutes.map((minute) => ({ value: minute, label: minute })),
    };
    options.push(hoverObject);
  }

  return options;
};
