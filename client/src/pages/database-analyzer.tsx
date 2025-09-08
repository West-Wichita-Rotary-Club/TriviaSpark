import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Database, Table as TableIcon, Key, Users, Calendar, FileText, Award, MessageSquare, BarChart3, RefreshCw, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

interface DatabaseTable {
  name: string;
  rowCount: number;
  createSql: string;
}

interface DatabaseInfo {
  databasePath: string;
  databaseSize: number;
  tableCount: number;
  tables: DatabaseTable[];
}

interface TableColumn {
  cid: number;
  name: string;
  type: string;
  notNull: boolean;
  defaultValue: any;
  primaryKey: boolean;
}

interface TableIndex {
  name: string;
  unique: boolean;
  columns: string[];
}

interface TableForeignKey {
  id: number;
  seq: number;
  table: string;
  from: string;
  to: string;
  onUpdate: string;
  onDelete: string;
  match: string;
}

interface TableAnalysis {
  tableName: string;
  rowCount: number;
  columnCount: number;
  columns: TableColumn[];
  indexes: TableIndex[];
  foreignKeys: TableForeignKey[];
  sampleData: Record<string, any>[];
}

const getTableIcon = (tableName: string) => {
  const name = tableName.toLowerCase();
  if (name.includes('user')) return Users;
  if (name.includes('event')) return Calendar;
  if (name.includes('question')) return FileText;
  if (name.includes('response')) return MessageSquare;
  if (name.includes('team')) return Award;
  if (name.includes('participant')) return Users;
  return TableIcon;
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function DatabaseAnalyzer() {
  const [, setLocation] = useLocation();
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const { data: dbInfo, isLoading: dbLoading, error: dbError, refetch: refetchDb } = useQuery<DatabaseInfo>({
    queryKey: ["/api/db/analyze"],
    retry: false
  });

  const { data: tableAnalysis, isLoading: tableLoading, error: tableError } = useQuery<TableAnalysis>({
    queryKey: ["/api/db/analyze/table", selectedTable],
    enabled: !!selectedTable,
    retry: false
  });

  const handleBackToDashboard = () => {
    setLocation("/dashboard");
  };

  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName);
  };

  const handleBackToOverview = () => {
    setSelectedTable(null);
  };

  if (dbLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-wine-50 to-champagne-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-wine-600 mx-auto mb-2" />
          <p className="text-wine-700">Loading database information...</p>
        </div>
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-wine-50 to-champagne-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              Database Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Failed to connect to the database. Please ensure the database file exists and is accessible.
            </p>
            <div className="space-y-2">
              <Button onClick={() => refetchDb()} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Connection
              </Button>
              <Button variant="outline" onClick={handleBackToDashboard} className="w-full">
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedTable) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-wine-50 to-champagne-50 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Database className="h-8 w-8 text-wine-600 mr-3" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Database Analyzer</h1>
                  <p className="text-gray-600">Explore and analyze database tables and structure</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleBackToDashboard}>
                Back to Dashboard
              </Button>
            </div>
          </div>

          {/* Database Overview */}
          {dbInfo && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Database Size</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-wine-600">
                    {formatBytes(dbInfo.databaseSize)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{dbInfo.databasePath}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Tables</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-wine-600">
                    {dbInfo.tableCount}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Database tables</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-wine-600">
                    {dbInfo.tables.reduce((sum, table) => sum + table.rowCount, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">All tables combined</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tables Grid */}
          {dbInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TableIcon className="h-5 w-5 mr-2" />
                  Database Tables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dbInfo.tables.map((table) => {
                    const Icon = getTableIcon(table.name);
                    return (
                      <Card 
                        key={table.name} 
                        className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-wine-200"
                        onClick={() => handleTableSelect(table.name)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <Icon className="h-5 w-5 text-wine-600" />
                            <Badge variant="secondary" className="text-xs">
                              {table.rowCount.toLocaleString()} rows
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">{table.name}</h3>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            Click to analyze table structure and data
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Table Analysis View
  return (
    <div className="min-h-screen bg-gradient-to-br from-wine-50 to-champagne-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Button variant="ghost" onClick={handleBackToOverview} className="mr-3">
                ← Back to Tables
              </Button>
              <div className="flex items-center">
                {(() => {
                  const Icon = getTableIcon(selectedTable);
                  return <Icon className="h-6 w-6 text-wine-600 mr-2" />;
                })()}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{selectedTable}</h1>
                  <p className="text-gray-600">Table analysis and data preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {tableLoading && (
          <div className="flex justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-wine-600" />
          </div>
        )}

        {tableError && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center text-red-600">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>Error loading table analysis</span>
              </div>
            </CardContent>
          </Card>
        )}

        {tableAnalysis && (
          <div className="space-y-6">
            {/* Table Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Rows</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-wine-600">
                    {tableAnalysis.rowCount.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Columns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-wine-600">
                    {tableAnalysis.columnCount}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Indexes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-wine-600">
                    {tableAnalysis.indexes.length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Table Schema */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Table Schema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Column</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Constraints</TableHead>
                        <TableHead>Default</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tableAnalysis.columns.map((column) => (
                        <TableRow key={column.cid}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              {column.primaryKey && <Key className="h-3 w-3 text-yellow-500 mr-1" />}
                              {column.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{column.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {column.primaryKey && <Badge variant="default" className="text-xs">PK</Badge>}
                              {column.notNull && <Badge variant="secondary" className="text-xs">NOT NULL</Badge>}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-500">
                            {column.defaultValue !== null ? String(column.defaultValue) : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Indexes and Foreign Keys */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Indexes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Indexes ({tableAnalysis.indexes.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {tableAnalysis.indexes.length > 0 ? (
                    <div className="space-y-2">
                      {tableAnalysis.indexes.map((index, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="font-medium text-sm">{index.name}</span>
                          <div className="flex items-center gap-2">
                            {index.unique && <Badge variant="outline" className="text-xs">UNIQUE</Badge>}
                            <span className="text-xs text-gray-500">{index.columns.join(', ')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No indexes defined</p>
                  )}
                </CardContent>
              </Card>

              {/* Foreign Keys */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Foreign Keys ({tableAnalysis.foreignKeys.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {tableAnalysis.foreignKeys.length > 0 ? (
                    <div className="space-y-2">
                      {tableAnalysis.foreignKeys.map((fk, i) => (
                        <div key={i} className="p-2 bg-gray-50 rounded">
                          <div className="text-sm font-medium">
                            {fk.from} → {fk.table}.{fk.to}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ON UPDATE: {fk.onUpdate} | ON DELETE: {fk.onDelete}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No foreign keys defined</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sample Data */}
            <Card>
              <CardHeader>
                <CardTitle>Sample Data (First 10 rows)</CardTitle>
              </CardHeader>
              <CardContent>
                {tableAnalysis.sampleData.length > 0 ? (
                  <ScrollArea className="h-96 w-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {tableAnalysis.columns.map((column) => (
                            <TableHead key={column.name} className="min-w-[120px]">
                              {column.name}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tableAnalysis.sampleData.map((row, i) => (
                          <TableRow key={i}>
                            {tableAnalysis.columns.map((column) => (
                              <TableCell key={column.name} className="max-w-[200px] truncate">
                                {row[column.name] !== null && row[column.name] !== undefined
                                  ? String(row[column.name])
                                  : '—'}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                ) : (
                  <p className="text-gray-500 text-center py-8">No data found in this table</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
