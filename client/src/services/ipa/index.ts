
// Export both the original and scalable service implementations
import { ipaService } from './ipaService';
import { scalableIpaService } from './services/scalableIpaService';

// Use scalable service for production-ready high-concurrency support
export { scalableIpaService as ipaService, ipaService as originalIpaService };
