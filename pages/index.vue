<template>
    <section class="container">
        <div>
            <img src="~/assets/shopping-basket.svg"
                 class="logo">
            <h1 class="title">
                Supermarket List
            </h1>


            <div class="add">
                <input v-model="message"
                       @keyup.enter="addItem()" />
                <button @click="addItem()">
                    add
                </button>

                <ul class="suggest-list"
                    v-if="suggest.length !== 0">
                    <li
                        v-for="(item, index) in suggest"
                        :key="index"
                        @click="message = item;addItem()">
                        {{ item }}
                    </li>
                </ul>

            </div>

            <div v-if="getList.length === 0">
                Empty list :(
            </div>

            <ul v-else class="list">
                <li v-for="(message, key) in getList"
                    :key="key">
                    <span class="item">{{ message }}</span>
                    <span @click="removeItem(key)"
                          class="delete">x</span>
                </li>
            </ul>
        </div>
    </section>
</template>

<script>
    import {mapActions, mapGetters} from 'vuex';
    import socket from '~/plugins/socket.io';

    export default {
        data() {
            return {
                message: undefined,
            };
        },
        mounted() {
            socket.on('get-messages', (messages) => {
                if (!messages) messages = [];
                this.updateList(messages);
            });
            socket.on('get-suggest', (messages) => {
                if (!messages) messages = [];
                this.updateSuggest(messages);
            });
        },
        computed: {
            ...mapGetters('application', [
                'getList',
                'getSuggest',
            ]),
            suggest() {
                if (!this.message || this.message.length < 2) return [];
                let suggest = [];
                const query = this.message.toLowerCase();
                for (let item in this.getSuggest) {
                    if (this.getSuggest.hasOwnProperty(item) && item.toLowerCase().indexOf(query) !== -1) suggest.push(item);
                }
                return suggest;
            }
        },
        methods: {
            ...mapActions('application', ['updateList', 'updateSuggest']),
            addItem() {
                if (!this.message) return;
                socket.emit('send-message', this.message);
                this.message = '';
            },
            removeItem(value) {
                socket.emit('remove-message', value);
            }
        }
    };
</script>

<style lang="scss">

    .logo {
        width: 100px;
    }

    .container {
        font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
        'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        margin: 40px auto;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
    }

    .title {
        display: block;
        font-size: 2rem;
        color: #35495e;
        letter-spacing: 1px;
    }

    .add {
        margin: 20px 0;

        input {
            padding: 8px;
            font-size: 1rem;
        }

        button {
            padding: 8px;
            font-size: 1rem;
        }
    }

    .suggest-list {
        margin-top: 10px;
        background: #F5F5F5;
        border: 1px solid #e5e6e9;
        list-style: none;
        text-align: left;
        padding: 0;

        li {
            border-bottom: 1px solid #dfe0e3;
            padding: 10px;
            cursor: pointer;

            &:last-child {
                border: none;
            }
        }
    }

    .list {
        list-style: none;
        margin: 20px 0;
        padding: 0;
        display: flex;
        flex-direction: column-reverse;
        max-width: 300px;

        li {
            flex: 1;
            margin: 10px 0;
            width: 100%;
            display: flex;
            justify-content: space-between;
            background: #F5F5F5;
            border: 1px solid #b8bdca;
            padding: 0 0 0 10px;
            line-height: 1.4rem;
            border-radius: 8px;
            overflow: hidden;
            align-items: center;

            .item {
                max-width: 80%;
                text-align: left;
            }

            .delete {
                padding: 6px 15px;
                background: red;
                color: white;
                font-weight: bold;
                cursor: pointer;

                &:hover {
                    opacity: .5;
                }
            }
        }
    }
</style>
