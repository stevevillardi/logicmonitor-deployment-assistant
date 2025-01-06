import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../hooks/useAuth';
import { FileText, Download, Loader2 } from 'lucide-react';

const LogicMonitorDoc = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

  const createDocument = async () => {
    if (!user?.email) {
      console.error('No user email found');
      return;
    }

    setIsLoading(true);
    try {
        const testContent = [
            {
              type: 'cover',
              content: {
                title: 'Evaluation Progress Tracking',
                subtitle: 'Proof of Value Documentation',
                contacts: [
                  { role: 'Account Executive', email: 'account.executive@logicmonitor.com' },
                  { role: 'Sales Engineer', email: 'sales.engineer@logicmonitor.com' }
                ]
              }
            },
            // Table of Contents
            {
              type: 'table',
              content: [
                ['Executive Summary', '2'],
                ['Company Background', '2'],
                ['Key Business Services', '3'],
                ['Current Situation/Challenges', '4'],
                ['Decision Criteria', '4'],
                ['Scope of Architecture: IPM', '7'],
                ['Scope of Architecture: APM', '8'],
                ['Timeline', '9'],
                ['Mutual Action Plan', '10'],
                ['POV Team', '11']
              ]
            },
            {
              type: 'heading',
              content: 'Executive Summary'
            },
            {
              type: 'paragraph',
              content: 'First, write a sentence or two about the Before Scenarios and the Negative Consequences of maintaining the current monitoring strategy. Then highlight the Positive Business Outcomes we\'re trying to emulate through the evaluation. Consider the Required Capabilities that will be needed for testing, and what Metrics will be used to measure success. Take a second to mention how LogicMonitor will help, and how we will do it differently/uniquely.'
            },
            {
              type: 'heading',
              content: 'Company Background'
            },
            {
              type: 'paragraph',
              content: 'What do they do - and more importantly - what is valuable to the business?\n\nACME Services sells advanced medical equipment and consumables to hospitals and doctors offices. ACME is expanding their headcount and customer-base. They are looking for ways to improve operational efficiency in order to grow their business.\n\nThe Infrastructure Services team is strategizing how to automate and standardize their operations, decrease deployment time to new sites, and cover their current gaps in visibility.'
            },
            {
              type: 'section',
              content: {
                title: 'Corporate Objectives',
                items: [
                  'List',
                  'List',
                  'List'
                ]
              }
            },
            {
              type: 'section',
              content: {
                title: 'Business Strategies',
                items: [
                  'List',
                  'List'
                ]
              }
            },
            {
              type: 'heading',
              content: 'Key Business Services'
            },
            {
              type: 'subheading',
              content: 'Business Services, Areas of Team Responsibility, KPIs'
            },
            {
              type: 'table',
              content: [
                ['Key Technologies', 'Business Service – What does the technology deliver?', 'Owners', 'Desired KPIs'],
                ['Cloud, Containers, Web Servers, SQL DB, K8s', 'Mortgage Banking Application Process: IPM', 'Network and Server teams', 'SLA: 5-9s availability'],
                ['Home grown apps: Python, Java, .Net, NodeJS', 'Mortgage Banking Application Process: APM', 'DevOps', 'Latency: 250ms max\nError Rate: < 99.99%'],
                ['Network, local file server, endpoints', 'Bank branches', 'Real Estate, SRE, Network and Server teams', 'As little downtime as possible']
              ]
            },
            {
              type: 'heading',
              content: 'Current Situation/Challenges'
            },
            {
              type: 'table',
              content: [
                ['Challenge', 'Business Impact + Example', 'Desired Outcomes', 'Required Capability'],
                ['Currently able to monitor tech stack behind Mortgage App, but alerts are disorganized due to tool sprawl. This leads to slower response times from support and infrastructure teams', 'Support escalates tickets to the network team, who escalate them to the DB team. The DB team doesn\'t manage resources, so they bumped it to the Server team, who finally allocated additional drive space. Total TTR: 48hrs. Because buyers and sellers review offers in less than 24hrs in the current RE market, that leads to significant loss in potential mortgages being opened.', 'Lower MTTR: 8hrs max to lead to 5-9s availability', 'Please Select']
              ]
            },
            {
              type: 'heading',
              content: 'Decision Criteria'
            },
            {
              type: 'section',
              content: {
                title: 'Decision Criteria: Improve scalability for M+A sites – Standardize device onboarding and streamline monitoring for new infrastructure',
                items: []
              }
            },
            {
              type: 'table',
              content: [
                ['Use Cases', 'Priority', 'Portal Activities:', 'Status'],
                ['Deploy Collectors to [LOCATION 1] and onboard devices in less than 90 minutes per site\n\nRequired Capability Fulfilled: Modern SaaS and agentless delivery model', 'Assign', '1. Deploy Collector(s)\n2. Create groups for device categorization (location, priority, app?)\n3. Create and run NetScans to Unmonitored Group or defined device groups\n4. If Unmonitored, select devices and move to correct group', 'Not Started'],
                ['Onboard Cloud and SaaS accounts for monitoring in less than 90 minutes\n\nRequired Capability Fulfilled: Modern SaaS and agentless delivery model', 'Assign', '1. Onboard Azure, AWS\n2. Onboard Office365', 'Not Started']
              ]
            },
            {
              type: 'section',
              content: {
                title: 'Decision Criteria: Enable teams to respond to alerts more accurately and effectively; Understand context and correlation between application-infrastructure health',
                items: []
              }
            },
            {
              type: 'table',
              content: [
                ['Use Cases', 'Priority', 'Portal Activities:', 'Status'],
                ['Perform alert analysis on OOTB alerts and modify 3-4 alert thresholds', 'Assign', '1. Display header graph on alerts page\n2. Review alerts by Resource and Datasource to determine appropriate thresholds\n3. Enable dynamic thresholds (or modify static thresholds) for alerts', 'Not Started'],
                ['Rapidly identify the root cause of an issue', 'Assign', '1. Implement relevant logs monitoring\n2. Study log messages and review anomalies ingested', 'Not Started']
              ]
            },
            {
              type: 'heading',
              content: 'Scope of Architecture: IPM'
            },
            {
              type: 'table',
              content: [
                ['Location 1', 'Site Name (Primary DC, HQ, etc)'],
                ['Devices (count)', 'Windows x30\nLinux x40\nvCenter x2\nCisco Meraki Networks x12'],
                ['Protocols', 'WMI\nLinux SNMP or OpenMetrics\nMeraki SNMP\nMeraki API\nvSphere\nSyslog'],
                ['LM Architecture', 'Large Windows Collector x2 (ABCG)\nMed Linux Collector (Netflow and Logs)'],
                ['LM Cloud/SaaS', 'GCP subscription x1\nAWS subscription x1\n- List\n- Core\n- Services\n- And add more\nOffice365 subscription x1']
              ]
            },
            {
              type: 'heading',
              content: 'Scope of Architecture: APM'
            },
            {
              type: 'table',
              content: [
                ['Application 1', 'Online Retail Cart'],
                ['Languages', '.Net\nJava'],
                ['Instrumentation Method', 'Auto-instrumentation'],
                ['Infrastructure', 'Lambda\nAKS\nEC2\nDC 01'],
                ['LM Architecture', 'OTel Collector x1']
              ]
            },
            {
              type: 'heading',
              content: 'Timeline'
            },
            {
              type: 'table',
              content: [
                ['Meeting', 'Agenda', 'Date + Time'],
                ['Kickoff Meeting', 'Define parameters for testing, confirm scoping doc is completed in full and accepted by all parties', 'Today'],
                ['Email', 'SEs to send pre-requisite documentation based on vendor types and scope of architecture', 'Dec 20'],
                ['Go/No-Go', 'Confirm VMs, credentials, security requirements, and engineering teams are prepared for January 23rd meeting', 'Jan 19'],
                ['Primary DC Onboarding', '- First portal login\n- Deploy 2 Collectors to Primary DC\n- Create Device Groups based on type (eg Meraki, etc)\n- Add appropriate credentials to groups\n- Create and run NetScan job for Primary DC\n- Enable Log collection (Windows, Meraki, Linux)\n- Review populated dashboards\n- Send playback via email', 'Jan 23'],
                ['Cloud Account Onboarding', '- Review last working session\n- Add AWS, Azure, and Office365 accounts\n- Review Cloud Dashboards\n- Send playback via email', 'Jan 26'],
                ['Alert Analysis and Routing', '- Review last working session\n- View alerts and modify 3-4 thresholds\n- Create ITSM webhook and alert rule\n- Log Anomaly Review\n- Send playback via email', 'Jan 31'],
                ['Final Meeting', '- Review all working sessions\n- Collaborate for POV findings presentation', 'Feb 02'],
                ['End', 'Portal is suspended', 'Feb 05']
              ]
            },
            {
              type: 'heading',
              content: 'POV Team'
            },
            {
              type: 'table',
              content: [
                ['[Insert customer company name]', ''],
                ['[INFLUENCER NAME, ROLE]', 'contact info'],
                ['[CHAMPION NAME, ROLE]', 'contact info'],
                ['[EXECUTIVE BUYER, ROLE]', 'contact info']
              ]
            },
            {
              type: 'table',
              content: [
                ['LogicMonitor', ''],
                ['[AE name, role]', 'contact info'],
                ['[SE name, role]', 'contact info'],
                ['[Executive sponsor name, role]', 'contact info']
              ]
            }
          ];

      const response = await fetch('/api/docx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'POV Documentation',
          contents: testContent,
          userEmail: user.email
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate document');
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'LogicMonitor-POV-Documentation.docx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setLastGenerated(new Date());
    } catch (error) {
      console.error('Error creating document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            LogicMonitor POV Documentation
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate a professionally formatted proof of value document with your organization&apos;s details.
          </p>
        </div>

        <div className="flex flex-col space-y-4">
          <Button 
            onClick={createDocument}
            className="bg-[#0046E5] hover:bg-[#0035B0] text-white w-fit"
            disabled={isLoading || !user?.email}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Document...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate POV Document
              </>
            )}
          </Button>

          {lastGenerated && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last generated: {lastGenerated.toLocaleString()}
            </p>
          )}

          {!user?.email && (
            <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/50 p-4">
              <p className="text-sm text-yellow-700 dark:text-yellow-200">
                Please sign in to generate documents.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogicMonitorDoc;