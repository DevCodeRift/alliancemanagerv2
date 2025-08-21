import { GraphQLClient } from 'graphql-request';

export const pnwClient = new GraphQLClient(
  process.env.PNW_API_BASE_URL || 'https://api.politicsandwar.com/graphql'
);

// GraphQL Queries
export const GET_NATION_QUERY = `
  query GetNation($id: [Int!], $name: [String!]) {
    nations(id: $id, name: $name, first: 1) {
      data {
        id
        nation_name
        leader_name
        alliance_id
        alliance {
          name
          acronym
        }
        score
        cities
        color
        continent
        war_policy
        domestic_policy
        last_active
        soldiers
        tanks
        aircraft
        ships
        missiles
        nukes
        spies
        population
        land
        infra_destroyed_value
        infra_destroyed
        infrastructure
        resource_production {
          oil
          coal
          iron
          bauxite
          lead
          uranium
          food
          steel
          aluminum
          gasoline
          munitions
        }
      }
    }
  }
`;

export const VERIFY_API_KEY_QUERY = `
  query VerifyApiKey($api_key: String!) {
    me(api_key: $api_key) {
      nation {
        id
        nation_name
        leader_name
        alliance_id
        alliance {
          name
          acronym
        }
        color
        continent
        war_policy
        domestic_policy
        score
        cities
        soldiers
        tanks
        aircraft
        ships
        last_active
      }
    }
  }
`;

export const GET_ALLIANCE_QUERY = `
  query GetAlliance($id: [Int!]) {
    alliances(id: $id, first: 1) {
      data {
        id
        name
        acronym
        color
        score
        average_score
        members
        flag
        forum_link
        discord_link
        wiki_link
        founded_date
        accepted_members
        treaties {
          treaty_type
          turns_left
          alliance1_id
          alliance2_id
          alliance1 {
            name
            acronym
          }
          alliance2 {
            name
            acronym
          }
        }
      }
    }
  }
`;

export const GET_ALLIANCE_MEMBERS_QUERY = `
  query GetAllianceMembers($alliance_id: [Int!]) {
    nations(alliance_id: $alliance_id, first: 100) {
      data {
        id
        nation_name
        leader_name
        score
        cities
        color
        alliance_position
        last_active
        soldiers
        tanks
        aircraft
        ships
        missiles
        nukes
      }
    }
  }
`;

export const GET_WARS_QUERY = `
  query GetWars($alliance_id: [Int!]) {
    wars(alliance_id: $alliance_id, first: 50) {
      data {
        id
        date
        reason
        war_type
        ground_control
        air_superiority
        naval_blockade
        winner_id
        turns_left
        attacker_id
        defender_id
        attacker {
          nation_name
          leader_name
          alliance {
            name
            acronym
          }
        }
        defender {
          nation_name
          leader_name
          alliance {
            name
            acronym
          }
        }
        attacks {
          id
          date
          attacker_id
          defender_id
          type
          war_id
          victor
          success
          attcas1
          attcas2
          defcas1
          defcas2
          city_id
          infra_destroyed
          improvements_lost
          money_looted
          loot_info
        }
      }
    }
  }
`;

// Helper functions
export async function getNationData(nationId: number) {
  try {
    const response = await pnwClient.request(GET_NATION_QUERY, {
      id: [nationId]
    }) as any;
    return response.nations?.data?.[0] || null;
  } catch (error) {
    console.error('Error fetching nation data:', error);
    return null;
  }
}

export async function searchNationByName(nationName: string) {
  try {
    const response = await pnwClient.request(GET_NATION_QUERY, {
      name: [nationName]
    }) as any;
    return response.nations?.data || [];
  } catch (error) {
    console.error('Error searching nation:', error);
    return [];
  }
}

export async function verifyApiKey(apiKey: string) {
  try {
    const response = await pnwClient.request(VERIFY_API_KEY_QUERY, {
      api_key: apiKey
    }) as any;
    return response.me?.nation || null;
  } catch (error) {
    console.error('Error verifying API key:', error);
    return null;
  }
}

export async function getAllianceData(allianceId: number) {
  try {
    const response = await pnwClient.request(GET_ALLIANCE_QUERY, {
      id: [allianceId]
    }) as any;
    return response.alliances?.data?.[0] || null;
  } catch (error) {
    console.error('Error fetching alliance data:', error);
    return null;
  }
}

export async function getAllianceMembers(allianceId: number) {
  try {
    const response = await pnwClient.request(GET_ALLIANCE_MEMBERS_QUERY, {
      alliance_id: [allianceId]
    }) as any;
    return response.nations?.data || [];
  } catch (error) {
    console.error('Error fetching alliance members:', error);
    return [];
  }
}

export async function getAllianceWars(allianceId: number) {
  try {
    const response = await pnwClient.request(GET_WARS_QUERY, {
      alliance_id: [allianceId]
    }) as any;
    return response.wars?.data || [];
  } catch (error) {
    console.error('Error fetching wars:', error);
    return [];
  }
}
