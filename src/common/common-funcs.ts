export const getAppData = () => getApp().data;
export const confidenceCoppy = (num: number): string => {
  const COPY_MAP = {
    stage1: {title: "额..", range: [0, 30]},
    stage2: {title: "不错哟，", range: [30, 50]},
    stage3: {title: "厉害！", range: [50, 60]},
    stage4: {title: "犀利！", range: [60, 70]},
    stage5: {title: "Holy awesome！！", range: [70, 80]},
    stage6: {title: "是ta本人？", range: [80, 90]},
    stage7: {title: "嘿嘿，就是此人！", range: [90, 100]},
  };
  for (const key in COPY_MAP) {
    if (num >= COPY_MAP[key].range[0] && num < COPY_MAP[key].range[1] ) {
      return COPY_MAP[key].title;
    }
  }
  return "嘿嘿";
};

export const reverseList = <T>(list: T[]): T[] => {
  const reverse = (sumLi: T[], restLi: T[]) => {
    if (!restLi.length ) {
      return sumLi;
    }
    return reverse(sumLi.concat(restLi[restLi.length - 1]), restLi.slice(0, -1));
  };
  return reverse([], list);
};
