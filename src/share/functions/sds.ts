import _ from "lodash";

const removeUndefinedDeep = (obj: any): any => {
  if (_.isArray(obj)) {
    return _.filter(
      _.map(obj, removeUndefinedDeep),
      (item: any) => !_.isUndefined(item)
    );
  } else if (_.isObject(obj) && !_.isFunction(obj)) {
    return _.transform(obj, (result, value, key) => {
      const cleanedValue = removeUndefinedDeep(value);
      if (!_.isUndefined(cleanedValue)) {
        result[key] = cleanedValue;
      }
    });
  }
  return obj;
};

export default removeUndefinedDeep;
