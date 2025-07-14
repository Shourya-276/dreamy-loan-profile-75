
import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import SalesManagerLayout from "../components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InitiatePartDisbursementTab from "../components/disbursement/InitiatePartDisbursementTab";
import InitiateNewDisbursementTab from "../components/disbursement/InitiateNewDisbursementTab";
import InitiateDocumentsRequestTab from "../components/disbursement/InitiateDocumentsRequestTab";

const SalesManagerInitiateDisbursement = () => {
  const [searchParams] = useSearchParams();
  const view = searchParams.get("view");

  if (view === "documents-request") {
    return (
      <SalesManagerLayout>
        <InitiateDocumentsRequestTab />
      </SalesManagerLayout>
    );
  }

  return (
    <SalesManagerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Initiate Disbursement</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and initiate disbursement requests</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <Tabs defaultValue="part-disbursement" className="w-full">
            <div className="border-b border-gray-200 dark:border-gray-700 px-6">
              <TabsList className="bg-transparent h-auto p-0 space-x-8">
                <TabsTrigger 
                  value="part-disbursement"
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-brand-purple data-[state=active]:bg-transparent rounded-none px-0 py-4"
                >
                  Part Disbursement
                </TabsTrigger>
                <TabsTrigger 
                  value="new-disbursement"
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-brand-purple data-[state=active]:bg-transparent rounded-none px-0 py-4"
                >
                  New Disbursement
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="part-disbursement" className="p-6 mt-0">
              <InitiatePartDisbursementTab />
            </TabsContent>
            
            <TabsContent value="new-disbursement" className="p-6 mt-0">
              <InitiateNewDisbursementTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SalesManagerLayout>
  );
};

export default SalesManagerInitiateDisbursement;
