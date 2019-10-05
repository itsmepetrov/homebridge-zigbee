module.exports = {
  report: 'color',
  reportParser: data => data,
  get: 'color',
  getParser: data => data,
  set: () => 'moveToColor',
  setParser: (value, device) => {
    console.log(value)
    console.log(device)
    return ({
      colorx: device.currentX,
      colory: device.currentY,
      tanstime: 5,
    })
  },
}
