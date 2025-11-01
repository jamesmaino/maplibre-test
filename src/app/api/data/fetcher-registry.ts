
import { fetchFulcrumData } from './fetchers/fulcrum';
import { fetchGraphQLData } from './fetchers/graphql';

export const fetcherRegistry = {
  fulcrum: fetchFulcrumData,
  graphql: fetchGraphQLData,
};
