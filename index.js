"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_1 = __importStar(require("../../plugin"));
class Coin extends plugin_1.default {
    constructor() {
        super();
        this.name = '兑换硬币';
        this.description = '将银瓜子兑换成硬币';
        this.version = '0.0.2';
        this.author = 'lzghzr';
        this._silver2coinList = new Map();
    }
    async load({ defaultOptions, whiteList }) {
        defaultOptions.newUserData['silver2coin'] = false;
        defaultOptions.info['silver2coin'] = {
            description: '兑换硬币',
            tip: '将银瓜子兑换成硬币',
            type: 'boolean'
        };
        whiteList.add('silver2coin');
        this.loaded = true;
    }
    async start({ users }) {
        this._silver2coin(users);
    }
    async loop({ cstMin, cstHour, cstString, users }) {
        if (cstString === '00:10')
            this._silver2coinList.clear();
        if (cstMin === 30 && cstHour % 8 === 4)
            this._silver2coin(users);
    }
    _silver2coin(users) {
        users.forEach(async (user, uid) => {
            if (this._silver2coinList.get(uid) || !user.userData['silver2coin'])
                return;
            const exchange = {
                method: 'POST',
                url: `https://api.live.bilibili.com/AppExchange/silver2coin?${plugin_1.AppClient.signQueryBase(user.tokenQuery)}`,
                responseType: 'json',
                headers: user.headers
            };
            const silver2coin = await plugin_1.tools.XHR(exchange, 'Android');
            if (silver2coin !== undefined && silver2coin.response.statusCode === 200) {
                if (silver2coin.body.code === 0 || silver2coin.body.code === 403) {
                    this._silver2coinList.set(uid, true);
                    plugin_1.tools.Log(user.nickname, '兑换硬币', '已成功兑换硬币');
                }
                else
                    plugin_1.tools.Log(user.nickname, '兑换硬币', silver2coin.body);
            }
            else
                plugin_1.tools.Log(user.nickname, '兑换硬币', '网络错误');
        });
    }
}
exports.default = new Coin();
