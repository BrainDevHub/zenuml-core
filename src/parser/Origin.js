import { default as sequenceParser } from '../generated-parser/sequenceParser';
import {default as antlr4} from "antlr4";
const ParserRuleContext = antlr4.ParserRuleContext
const StatContext = sequenceParser.StatContext;
const ProgContext = sequenceParser.ProgContext;
const MessageContext = sequenceParser.MessageContext;
const CreationContext = sequenceParser.CreationContext;

ParserRuleContext.prototype.Origin = function () {
  let ctx = this.parentCtx;
  while(ctx && !((ctx instanceof StatContext) || (ctx instanceof ProgContext))) {
    ctx = this.parentCtx;
  }
  return ctx.Origin();
}
// Origin is essentially the 'from' of a message.
// For example, in `S -> A.m1 {B.m2 {C.m3}}`,
//                  |    |     |
// Origin of        m1   m2    m3
StatContext.prototype.Origin = function () {
  let ctx = this.parentCtx;
  while (ctx) {
    if (ctx instanceof ProgContext) {
      return ctx.Starter();
    }
    if (ctx instanceof MessageContext || ctx instanceof CreationContext) {
      const receiver = ctx.Owner();
      if (receiver) {
        return receiver;
      }
    }
    ctx = ctx.parentCtx;
  }
  return undefined;
};

ProgContext.prototype.Origin = function () {
  return this.Starter();
}

