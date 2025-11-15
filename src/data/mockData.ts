import { Client, Case, Documentation } from "@/types";

export const mockClients: Client[] = [
  {
    id: "client-1",
    name: "Müller GmbH",
    createdAt: "2025-01-10T10:00:00Z",
  },
  {
    id: "client-2",
    name: "Schmidt Consulting",
    createdAt: "2025-01-15T14:30:00Z",
  },
  {
    id: "client-3",
    name: "Weber & Partner",
    createdAt: "2025-02-01T09:15:00Z",
  },
];

export const mockCases: Case[] = [
  {
    id: "case-1",
    caseId: "CASE-2025-001",
    clientId: "client-1",
    title: "Vertragsverhandlung Projekt A",
    status: "OPEN",
    createdAt: "2025-01-12T11:00:00Z",
  },
  {
    id: "case-2",
    caseId: "CASE-2025-002",
    clientId: "client-1",
    title: "Nachbesprechung Quartal Q4",
    status: "CLOSED",
    createdAt: "2025-01-20T15:00:00Z",
  },
  {
    id: "case-3",
    caseId: "CASE-2025-003",
    clientId: "client-2",
    title: "Strategieberatung 2025",
    status: "OPEN",
    createdAt: "2025-02-05T10:30:00Z",
  },
  {
    id: "case-4",
    caseId: "CASE-2025-004",
    clientId: "client-3",
    title: "Rechtsberatung Fusion",
    status: "OPEN",
    createdAt: "2025-02-10T13:00:00Z",
  },
];

export const mockDocumentations: Documentation[] = [
  {
    id: "doc-1",
    caseId: "case-1",
    title: "Erstes Treffen - Anforderungsanalyse",
    date: "2025-01-15T10:00:00Z",
    audioFiles: [
      {
        id: "audio-1",
        fileName: "meeting_recording_01.mp3",
        createdAt: "2025-01-15T10:05:00Z",
        durationMs: 3600000, // 1 Stunde
        blobUrl: "blob:mock-audio-1",
        transcriptText: "Besprechung der Anforderungen für Projekt A. Der Kunde wünscht eine Lösung bis Ende März...",
      },
    ],
    attachments: [
      {
        id: "att-1",
        fileName: "anforderungen.pdf",
        fileType: "application/pdf",
        size: 245678,
        blobUrl: "blob:mock-attachment-1",
      },
    ],
    todos: "- Budget prüfen\n- Zeitplan erstellen\n- Team zusammenstellen",
    summaryText:
      "Initiales Meeting zur Erfassung der Projektanforderungen. Budget und Timeline wurden besprochen.",
    status: "VERIFIED",
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "doc-2",
    caseId: "case-1",
    title: "Follow-up Meeting - Zwischenstand",
    date: "2025-02-01T14:00:00Z",
    audioFiles: [
      {
        id: "audio-2",
        fileName: "followup_recording.mp3",
        createdAt: "2025-02-01T14:05:00Z",
        durationMs: 2700000, // 45 Minuten
        blobUrl: "blob:mock-audio-2",
      },
    ],
    attachments: [],
    todos: "- Prototyp präsentieren\n- Feedback einholen\n- Nächste Schritte planen",
    status: "OPEN",
    createdAt: "2025-02-01T14:00:00Z",
  },
  {
    id: "doc-3",
    caseId: "case-3",
    title: "Strategiegespräch Q1",
    date: "2025-02-08T09:00:00Z",
    audioFiles: [
      {
        id: "audio-3",
        fileName: "strategy_meeting.mp3",
        createdAt: "2025-02-08T09:10:00Z",
        durationMs: 5400000, // 1.5 Stunden
        blobUrl: "blob:mock-audio-3",
        transcriptText: "Diskussion über die strategische Ausrichtung für Q1 2025. Fokusthemen: Marktexpansion, Produktentwicklung...",
      },
    ],
    attachments: [
      {
        id: "att-2",
        fileName: "strategie_2025.pptx",
        fileType:
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        size: 1245678,
        blobUrl: "blob:mock-attachment-2",
      },
      {
        id: "att-3",
        fileName: "marktanalyse.xlsx",
        fileType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        size: 567890,
        blobUrl: "blob:mock-attachment-3",
      },
    ],
    todos:
      "- Marktanalyse finalisieren\n- Stakeholder informieren\n- Roadmap erstellen",
    summaryText:
      "Strategisches Planning Meeting für Q1. Prioritäten wurden definiert und Verantwortlichkeiten verteilt.",
    status: "IN_REVIEW",
    createdAt: "2025-02-08T09:00:00Z",
  },
  {
    id: "doc-4",
    caseId: "case-4",
    title: "Rechtliche Prüfung - Fusionsdokumente",
    date: "2025-02-12T11:00:00Z",
    audioFiles: [],
    attachments: [
      {
        id: "att-4",
        fileName: "fusionsvertrag_entwurf.pdf",
        fileType: "application/pdf",
        size: 3456789,
        blobUrl: "blob:mock-attachment-4",
      },
    ],
    todos:
      "- Vertragsentwurf prüfen\n- Rückfragen klären\n- Anwalt konsultieren",
    status: "OPEN",
    createdAt: "2025-02-12T11:00:00Z",
  },
];
