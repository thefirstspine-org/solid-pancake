import { Controller, Get } from '@nestjs/common';
import * as fs from 'fs';

/**
 * Controller to get the Sirup.js toolkit.
 */
@Controller('sirup.js')
export class SirupController {

  /**
   * Get the toolkit with the correct config.
   */
  @Get()
  index() {
    let str = fs.readFileSync(`${__dirname}/../assets/sirup.js`).toString();
    const config: Record<string, string> = {
      baseUrl: process.env.SOLID_PANCAKE_URL || '',
    };
    Object.keys(config).forEach((key: string) => {
      str = str.replace(`\{${key}\}`, config[key]);
    });
    return str;
  }

}