/**
 * Copyright (c) 2026 Setsuzoku Media Labs. All rights reserved.
 */
import { db } from '../../storage/db';

export interface WebsiteViewsStats {
  totalViews: number;
  uniqueVisitors: number;
}

export class AnalyticsService {
  /**
   * Retrieve aggregate website view statistics without exposing PII.
   */
  public async getWebsiteViews(): Promise<WebsiteViewsStats> {
    return db.getWebsiteViews();
  }

  /**
   * Record a website view using an optional hashed anonymous visitor identifier.
   */
  public async recordWebsiteView(visitorId?: string): Promise<WebsiteViewsStats> {
    return db.recordWebsiteView(visitorId);
  }
}

export const analyticsService = new AnalyticsService();

