export const state = () => ({
    listItems: [],
    suggestItems: [],
});

export const actions = {
    updateList({commit}, value) {
        commit('updateListItems', value);
    },
    updateSuggest({commit}, value) {
        commit('updateSuggestItems', value);
    }
};

export const getters = {
    getList: state => state.listItems,
    getSuggest: state => state.suggestItems
};

export const mutations = {
    updateListItems(state, value) {
        state.listItems = value;
    },
    updateSuggestItems(state, value) {
        state.suggestItems = value;
    }
};

