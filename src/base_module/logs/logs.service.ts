import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class LogsService {
  private logFilePath = 'logs/error.log';
  private maxLines = 100;

  async readErrorLogs(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      fs.readFile(this.logFilePath, 'utf8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          const errorLogs = data
            .split('\n')
            .filter((entry) => entry.includes('error'))
            .slice(0, this.maxLines)
            .map((entry) => entry + '<br><br>')
            .join('');
          resolve(errorLogs);
        }
      });
    });
  }
}
