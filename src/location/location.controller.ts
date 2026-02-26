import { Body, Controller, Post } from '@nestjs/common';
import { LocationRequestDto } from './dto/location-request.dto';
import { LocationService } from './location.service';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  async searchLocation(@Body() dto: LocationRequestDto) {
    try {
      const { name, lat, lng } = dto;
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        return {
          success: false,
          error: 'Invalid lat/lng',
        };
      }
      const addresses = await this.locationService.getAddressFromCoords(
        lat,
        lng,
      );
      return {
        success: true,
        addresses,
        name: name || 'User',
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }
}
