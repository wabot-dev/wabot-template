var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/run.ts
import { ChatAdapter, ChatRepository, container, WabotChatAdapter, PgChatRepository, runChatControllers, Env } from "@wabot-dev/framework";

// src/mindsets/MyMindset.ts
import { mindset } from "@wabot-dev/framework";
function _ts_decorate(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate, "_ts_decorate");
var MyMindset = class {
  static {
    __name(this, "MyMindset");
  }
  async workflow() {
    return ``;
  }
  async llms() {
    return [
      {
        model: "gpt-4o",
        provider: "openai"
      }
    ];
  }
  async identity() {
    return {
      name: "Elia",
      language: "Espa\xF1ol"
    };
  }
  async skills() {
    return "Saber sobre pokemons, sus poderes y su historia";
  }
  async limits() {
    return "";
  }
};
MyMindset = _ts_decorate([
  mindset()
], MyMindset);

// src/controllers/MyChatController.ts
import { chatBot, ChatBot, chatController, cmd } from "@wabot-dev/framework";
function _ts_decorate2(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate2, "_ts_decorate");
function _ts_metadata(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata, "_ts_metadata");
function _ts_param(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
__name(_ts_param, "_ts_param");
var MyChatController = class {
  static {
    __name(this, "MyChatController");
  }
  myBot;
  constructor(myBot) {
    this.myBot = myBot;
  }
  onMessage(context) {
    this.myBot.sendMessage(context.message, (replyMessage) => {
      context.reply(replyMessage);
    });
  }
};
_ts_decorate2([
  cmd(),
  _ts_metadata("design:type", Function),
  _ts_metadata("design:paramtypes", [
    typeof IReceivedMessage === "undefined" ? Object : IReceivedMessage
  ]),
  _ts_metadata("design:returntype", void 0)
], MyChatController.prototype, "onMessage", null);
MyChatController = _ts_decorate2([
  chatController(),
  _ts_param(0, chatBot(MyMindset)),
  _ts_metadata("design:type", Function),
  _ts_metadata("design:paramtypes", [
    typeof ChatBot === "undefined" ? Object : ChatBot
  ])
], MyChatController);

// src/run.ts
import { Pool } from "pg";
var env = container.resolve(Env);
container.registerInstance(Pool, new Pool({
  connectionString: env.requireString("DATABASE_URL")
}));
container.registerType(ChatAdapter, WabotChatAdapter);
container.registerType(ChatRepository, PgChatRepository);
runChatControllers([
  MyChatController
]);
//# sourceMappingURL=run.js.map