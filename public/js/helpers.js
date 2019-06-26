module.exports = {
  ifeq: function(a, b, options){
    if (a === b) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  },
  math: function(lvalue, operator, rvalue) {lvalue = parseFloat(lvalue);
    rvalue = parseFloat(rvalue);
    return {
      "+": lvalue + rvalue,
      "-": lvalue - rvalue,
      "*": lvalue * rvalue,
      "/": lvalue / rvalue,
      "%": lvalue % rvalue
    }[operator];
  },
};