export const transformServerData = (data) => {
  return {
    questions: data.dynamicForm.map((item) => ({
      title: item.title,
      formType: item.formType,
      options: Object.values(JSON.parse(item.jsonData)).map((value) => ({
        value,
      })),
      requiredStatus: item.requiredStatus,
      otherJson: item.otherJson,
    })),
  };
};
