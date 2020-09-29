"use strict";
/**
 * An exploration which demonstrates the queue growing and processing halting
 * after traffic exceeds 1900 events / 1000 ticks.
 *
 * This exploration exists to prove the design of the Database and Build
 * Service appropriately mock the architecture and problems listed in the
 * incident report.
 *
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var src_1 = require("../../src");
var database_1 = require("./database");
var balancer_1 = require("./balancer");
/*
   database 1
   Server 1
   Server 2 fails availability
   Server 3
*/
var s1 = new database_1.MySQLServer();
var s2 = new database_1.MySQLServer();
var s3 = new database_1.MySQLServer();
var db1 = new database_1.MySQLCluster([s1, s2, s3]);
/*
   database 2
   Server 4
   Server 5
   Server 6
*/
var s4 = new database_1.MySQLServer();
var s5 = new database_1.MySQLServer();
var s6 = new database_1.MySQLServer();
var db2 = new database_1.MySQLCluster([s4, s5, s6]);
//balancer
var bal = new balancer_1.Balancer([db1, db2]);
// scenario
src_1.simulation.keyspaceMean = 1000;
src_1.simulation.keyspaceStd = 200; // 68% - 1000 +/- 200    97% - 1000 +/- 400     99% 1000 +/- 600 
src_1.simulation.eventsPer1000Ticks = 1500;
function work() {
    return __awaiter(this, void 0, void 0, function () {
        var events;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, src_1.simulation.run(bal, 50000)];
                case 1:
                    events = _a.sent();
                    console.log("done");
                    src_1.stats.summary();
                    src_1.eventSummary(events);
                    return [2 /*return*/];
            }
        });
    });
}
work();
src_1.metronome.setTimeout(breakSQL, 5000);
function breakSQL() {
    s2.availability = 0;
}
// stats
function poll() {
    var now = src_1.metronome.now();
    var eventRate = src_1.simulation.getArrivalRate();
    src_1.stats.record("poll", { now: now, eventRate: eventRate, s1: s1.availability,
        s2: s2.availability,
        s3: s3.availability,
        s4: s4.availability,
        s5: s5.availability,
        s6: s6.availability });
    src_1.simulation.eventsPer1000Ticks += 100;
}
src_1.metronome.setInterval(poll, 1000);
