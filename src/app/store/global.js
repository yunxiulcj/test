const state = {
    symSetting: {},

  }
  const getters = {
    symSetting: (state) => {
      return state.symSetting
    },
  }
  const mutations = {
    SET_SYM_SETTING(state, symSetting) {
      state.symSetting = symSetting
    },
  }
  const actions = {}
  export default {
    state,
    mutations,
    getters,
    actions,
  }
  