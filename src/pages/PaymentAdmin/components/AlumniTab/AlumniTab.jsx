import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '../../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Input } from '../../../../components/ui/input';
import { Badge } from '../../../../components/ui/badge';
import { Search, Heart } from 'lucide-react';

const COMMUNITY_ALUMNI = [
  'Uduakabasi Abasiurua',
  'Zane Ahmed',
  'Tiffany Arnold',
  'Bert Casale',
  'Clifford Charles',
  'JuHao Chen',
  'Tafari Excell',
  'Marsha Hall',
  'Hady Mohamed',
  'Henry Nunez',
  'Oluwademilade Jobi',
  'Nasheed Jeremiah',
  'Antonio Martinez',
  'John Prado',
  'Tamzeed Rahman',
  'Xavier Rice',
  'Stephanie Lucano',
  'Rohan Sterling',
  'Emalee Soto',
  'Victoria Buchanan',
].sort((a, b) => a.localeCompare(b));

const AlumniTab = () => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return COMMUNITY_ALUMNI;
    const q = search.toLowerCase();
    return COMMUNITY_ALUMNI.filter((name) => name.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="alumni-tab p-6 space-y-6 max-w-7xl mx-auto">
      <div className="alumni-tab__header flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-[#4242EA]" />
            <h2 className="alumni-tab__title text-xl font-bold text-gray-900">Pursuit Community Alumni</h2>
          </div>
          <p className="alumni-tab__subtitle text-sm text-gray-500 mt-1">
            Alumni interested in staying engaged with the Pursuit community
          </p>
        </div>
        <Badge variant="outline" className="bg-[#4242EA]/5 text-[#4242EA] border-[#4242EA]/20 text-sm px-3 py-1">
          {COMMUNITY_ALUMNI.length} alumni
        </Badge>
      </div>

      <Card className="alumni-tab__card">
        <CardContent className="pt-6">
          <div className="alumni-tab__search relative mb-4 max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="alumni-tab__table border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-12 text-center font-medium">#</TableHead>
                  <TableHead className="font-medium">Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-sm text-gray-400 py-8">
                      No alumni match your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((name, i) => (
                    <TableRow key={name} className="hover:bg-gray-50">
                      <TableCell className="text-center text-xs text-gray-400 tabular-nums">{i + 1}</TableCell>
                      <TableCell className="font-medium text-gray-900">{name}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {search && filtered.length > 0 && (
            <p className="alumni-tab__count text-xs text-gray-500 mt-3">
              Showing {filtered.length} of {COMMUNITY_ALUMNI.length}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AlumniTab;
