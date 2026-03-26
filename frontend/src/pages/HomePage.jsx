import { useEffect, useMemo, useState } from 'react';
import { apiClient, extractErrorMessage } from '../api/client';
import { Banner } from '../components/common/Banner';
import { Button } from '../components/common/Button';
import { Chip } from '../components/common/Chip';
import { EmptyState } from '../components/common/EmptyState';
import { InputField } from '../components/common/InputField';
import { RestaurantCard } from '../components/common/RestaurantCard';
import { SectionHeader } from '../components/common/SectionHeader';
import { SelectField } from '../components/common/SelectField';
import { SkeletonCard } from '../components/common/Skeleton';

const sortOptions = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'rating_desc', label: 'Top Rated' },
  { value: 'eta_asc', label: 'Fastest Delivery' },
  { value: 'delivery_fee_asc', label: 'Lowest Delivery Fee' },
  { value: 'min_order_asc', label: 'Lowest Minimum Order' },
  { value: 'newest', label: 'Newest First' },
];

const popularCuisines = ['All', 'Bangladeshi', 'American', 'Italian', 'Asian', 'Dessert'];

export const HomePage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [query, setQuery] = useState('');
  const [locationHint, setLocationHint] = useState('Dhaka');
  const [cuisine, setCuisine] = useState('All');
  const [sort, setSort] = useState('recommended');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      setQuery(searchTerm.trim());
    }, 280);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      setError('');

      try {
        const { data } = await apiClient.get('/restaurants', {
          params: {
            q: query || undefined,
            cuisine: cuisine !== 'All' ? cuisine : undefined,
            sort,
            featured: featuredOnly ? true : undefined,
            page,
            limit: 9,
          },
        });

        setRestaurants(data.data || []);
        setMeta(data.meta || null);
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [query, cuisine, sort, featuredOnly, page]);

  const cuisineOptions = useMemo(() => {
    const fromResults = restaurants
      .map((restaurant) => restaurant.cuisineType)
      .filter(Boolean)
      .filter((value, index, all) => all.indexOf(value) === index);

    return [...new Set([...popularCuisines, ...fromResults])];
  }, [restaurants]);

  const resetFilters = () => {
    setSearchTerm('');
    setQuery('');
    setCuisine('All');
    setSort('recommended');
    setFeaturedOnly(false);
    setPage(1);
  };

  return (
    <div className="page-container space-y-6">
      <Banner
        title="Hungry? Your next favorite meal is one tap away."
        subtitle="Discover curated restaurants, best-in-class delivery speed, and transparent pricing with real-time order visibility."
        ctaLabel="Explore Featured"
        onCta={() => {
          setFeaturedOnly(true);
          setPage(1);
        }}
      />

      <section className="panel fade-up space-y-4">
        <SectionHeader
          title="Find your perfect order"
          subtitle="Search by restaurant or cuisine and sort by what matters most to you."
        />

        <div className="grid gap-3 md:grid-cols-[1.5fr,1fr,1fr]">
          <InputField
            label="Search"
            id="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search restaurants, dishes, cuisines"
          />

          <InputField
            label="Delivery Area"
            id="location"
            value={locationHint}
            onChange={(event) => setLocationHint(event.target.value)}
            placeholder="Enter your area"
            hint="Location UI is enabled; backend geofencing will be expanded in next phase."
          />

          <SelectField
            label="Sort By"
            id="sort"
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
              setPage(1);
            }}
            options={sortOptions}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {cuisineOptions.map((item) => (
            <Chip
              key={item}
              active={cuisine === item}
              onClick={() => {
                setCuisine(item);
                setPage(1);
              }}
            >
              {item}
            </Chip>
          ))}
          <Chip
            active={featuredOnly}
            onClick={() => {
              setFeaturedOnly((prev) => !prev);
              setPage(1);
            }}
          >
            Featured Only
          </Chip>
          <Button variant="ghost" onClick={resetFilters}>
            Reset
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="Restaurants"
          subtitle={
            meta
              ? `Showing ${restaurants.length} of ${meta.total} restaurants`
              : 'Freshly curated options for your current filters'
          }
        />

        {error && <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        )}

        {!loading && !error && restaurants.length === 0 && (
          <EmptyState
            title="No restaurants match this filter"
            description="Try changing search terms, cuisine, or featured filter to discover more options."
            actionLabel="Reset Filters"
            onAction={resetFilters}
          />
        )}

        {!loading && !error && restaurants.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-pink-100 bg-white px-4 py-3">
            <p className="text-sm text-ink-500">
              Page {meta.page} of {meta.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={!meta.hasPrevPage}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={!meta.hasNextPage}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
