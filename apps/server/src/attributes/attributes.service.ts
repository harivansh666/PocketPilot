import { Injectable } from '@nestjs/common';

@Injectable()
export class AttributesService {
    create() {
        // Implement the logic to create an attribute here
        // For now return the received body for verification
        return { id: 1, name: 'Sample Attribute' };
    }
}
