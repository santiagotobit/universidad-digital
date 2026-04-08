import * as periodsApi from "../api/periods";

export const periodsService = {
  list: periodsApi.listPeriods,
  create: periodsApi.createPeriod,
  update: periodsApi.updatePeriod,
  deactivate: periodsApi.deactivatePeriod,
  activate: periodsApi.activatePeriod
};
