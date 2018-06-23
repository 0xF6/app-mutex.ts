import { tmpdir } from "os";
import { existsSync, appendFileSync, readFileSync, unlinkSync } from "fs";
import { join } from "path";
import { pid } from "process";
import * as find from "find-process";
import { runLoopOnce } from "deasync";
import "linqable.ts";

/**
 * Mutext status type
 * @argument ERR_NOT_INIT - Mutex not been initiated
 * @argument CLEAR        - Mutex status - success, you can run application
 * @argument CONFLICT     - Mutex detected runned this application
 * @argument PID_DEAD     - Mutex was noticed that the application died
 */
type MutexStatus = "ERR_NOT_INIT" | "CLEAR" | "CONFLICT" | "PID_DEAD";
type processInfo = { pid: number, ppid: number, uid: number, gid: number, name: string, cmd: string }
/**
 * Single application mutex implimentation
 */
export class Mutex {
    /**
     * Name of Mutex
     */
    private _name: string;
    /**
     * callback
     */
    private _hook: (st: MutexStatus) => void;
    /**
     * Mutex status
     */
    private _status: MutexStatus = "ERR_NOT_INIT";
    constructor(name: string, createdNew?: (st: MutexStatus) => void) {
        this._name = name;
        this._hook = createdNew;
        this._lock();

    }
    /**
     * try lock mutext
     */
    private _lock() {
        let tempdir = tmpdir();
        let fileMutext = join(tempdir, `app-${this._name}.mutex`);


        if (existsSync(fileMutext)) {
            let mutext_pid = readFileSync(fileMutext, { encoding: "utf8" });
            if (Mutex.existPID(+mutext_pid).Any()) {
                this._status = "CONFLICT";
                this._hook(this._status);
            } else {
                unlinkSync(fileMutext);
                appendFileSync(fileMutext, pid.toString(), { encoding: "utf8" });
                this._status = "PID_DEAD";
                this._hook(this._status);
            }
        } else {
            appendFileSync(fileMutext, pid.toString(), { encoding: "utf8" });
            this._status = "CLEAR";
            this._hook(this._status);
        }

        // end process

        let onExit = () => {
            unlinkSync(fileMutext);
        };
        process.on('SIGINT', onExit);
        process.on('SIGTERM', onExit);
        process.on('beforeExit', onExit);
    }
    /**
     * getting status of mutex
     */
    public getStatus(): MutexStatus {
        return this._status;
    }
    /**
     * search pid from system
     * @param pid ProcessID
     * @description fuck node promises
     */
    public static existPID(pid: number): Array<processInfo> {
        var res = undefined;

        find('pid', pid).then((list) => {
            res = list;
        }, (err) => {
            res = [];
        });

        while (res === undefined) runLoopOnce();

        return res;
    }
}

