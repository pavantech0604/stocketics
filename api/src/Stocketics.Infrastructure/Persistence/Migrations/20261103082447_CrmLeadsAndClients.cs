using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocketics.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CrmLeadsAndClients : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "dnd_numbers",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    phone = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    client_name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    lead_id = table.Column<Guid>(type: "uuid", nullable: true),
                    reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    added_by_id = table.Column<Guid>(type: "uuid", nullable: true),
                    added_by_name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    version = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_dnd_numbers", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "import_batches",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    file_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    actor_id = table.Column<Guid>(type: "uuid", nullable: true),
                    actor_name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    total = table.Column<int>(type: "integer", nullable: false),
                    created_count = table.Column<int>(type: "integer", nullable: false),
                    duplicate_count = table.Column<int>(type: "integer", nullable: false),
                    failed_count = table.Column<int>(type: "integer", nullable: false),
                    assigned_to_team_leader_id = table.Column<Guid>(type: "uuid", nullable: true),
                    results_json = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    version = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_import_batches", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "lead_requests",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    owner_id = table.Column<Guid>(type: "uuid", nullable: false),
                    team_leader_id = table.Column<Guid>(type: "uuid", nullable: false),
                    manager_id = table.Column<Guid>(type: "uuid", nullable: true),
                    state = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    count = table.Column<int>(type: "integer", nullable: false),
                    remarks = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    required_by = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    approved_count = table.Column<int>(type: "integer", nullable: false),
                    allocated_count = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    version = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_lead_requests", x => x.id);
                    table.CheckConstraint("ck_lead_requests_count", "\"count\" > 0");
                    table.ForeignKey(
                        name: "FK_lead_requests_employees_manager_id",
                        column: x => x.manager_id,
                        principalTable: "employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_lead_requests_employees_owner_id",
                        column: x => x.owner_id,
                        principalTable: "employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_lead_requests_employees_team_leader_id",
                        column: x => x.team_leader_id,
                        principalTable: "employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "leads",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    phone = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    email = table.Column<string>(type: "character varying(254)", maxLength: 254, nullable: true),
                    state = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    city = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    source = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    campaign = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    priority = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    is_archived = table.Column<bool>(type: "boolean", nullable: false),
                    is_dnd = table.Column<bool>(type: "boolean", nullable: false),
                    last_response = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    next_follow_up_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    version = table.Column<int>(type: "integer", nullable: false),
                    owner_id = table.Column<Guid>(type: "uuid", nullable: true),
                    team_leader_id = table.Column<Guid>(type: "uuid", nullable: true),
                    manager_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_leads", x => x.id);
                    table.ForeignKey(
                        name: "FK_leads_employees_manager_id",
                        column: x => x.manager_id,
                        principalTable: "employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_leads_employees_owner_id",
                        column: x => x.owner_id,
                        principalTable: "employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_leads_employees_team_leader_id",
                        column: x => x.team_leader_id,
                        principalTable: "employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "notifications",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    lead_id = table.Column<Guid>(type: "uuid", nullable: true),
                    is_read = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    version = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notifications", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "lead_request_events",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    request_id = table.Column<Guid>(type: "uuid", nullable: false),
                    action = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    actor_name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    note = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    version = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_lead_request_events", x => x.id);
                    table.ForeignKey(
                        name: "FK_lead_request_events_lead_requests_request_id",
                        column: x => x.request_id,
                        principalTable: "lead_requests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "clients",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    client_code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    lead_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    phone = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    email = table.Column<string>(type: "character varying(254)", maxLength: 254, nullable: true),
                    state = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    city = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    source = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    campaign = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    converted_by_id = table.Column<Guid>(type: "uuid", nullable: true),
                    converted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    version = table.Column<int>(type: "integer", nullable: false),
                    owner_id = table.Column<Guid>(type: "uuid", nullable: true),
                    team_leader_id = table.Column<Guid>(type: "uuid", nullable: true),
                    manager_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_clients", x => x.id);
                    table.ForeignKey(
                        name: "FK_clients_employees_manager_id",
                        column: x => x.manager_id,
                        principalTable: "employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_clients_employees_owner_id",
                        column: x => x.owner_id,
                        principalTable: "employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_clients_employees_team_leader_id",
                        column: x => x.team_leader_id,
                        principalTable: "employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_clients_leads_lead_id",
                        column: x => x.lead_id,
                        principalTable: "leads",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "lead_activities",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    lead_id = table.Column<Guid>(type: "uuid", nullable: false),
                    type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    note = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    outcome = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    actor_id = table.Column<Guid>(type: "uuid", nullable: true),
                    actor_name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    actor_role = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    team_leader_at_time = table.Column<Guid>(type: "uuid", nullable: true),
                    status_at_time = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    next_due_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    original_activity_id = table.Column<Guid>(type: "uuid", nullable: true),
                    follow_up_id = table.Column<Guid>(type: "uuid", nullable: true),
                    detail = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    version = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_lead_activities", x => x.id);
                    table.ForeignKey(
                        name: "FK_lead_activities_leads_lead_id",
                        column: x => x.lead_id,
                        principalTable: "leads",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "lead_assignments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    lead_id = table.Column<Guid>(type: "uuid", nullable: false),
                    previous_owner_id = table.Column<Guid>(type: "uuid", nullable: true),
                    previous_team_leader_id = table.Column<Guid>(type: "uuid", nullable: true),
                    new_owner_id = table.Column<Guid>(type: "uuid", nullable: true),
                    new_team_leader_id = table.Column<Guid>(type: "uuid", nullable: true),
                    actor_id = table.Column<Guid>(type: "uuid", nullable: true),
                    actor_name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    source = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    request_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    version = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_lead_assignments", x => x.id);
                    table.ForeignKey(
                        name: "FK_lead_assignments_leads_lead_id",
                        column: x => x.lead_id,
                        principalTable: "leads",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "lead_followups",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    lead_id = table.Column<Guid>(type: "uuid", nullable: false),
                    due_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    created_by_id = table.Column<Guid>(type: "uuid", nullable: true),
                    response = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    completed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    completed_by_id = table.Column<Guid>(type: "uuid", nullable: true),
                    reminder_sent_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    version = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_lead_followups", x => x.id);
                    table.ForeignKey(
                        name: "FK_lead_followups_leads_lead_id",
                        column: x => x.lead_id,
                        principalTable: "leads",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "lead_request_allocations",
                columns: table => new
                {
                    request_id = table.Column<Guid>(type: "uuid", nullable: false),
                    lead_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_lead_request_allocations", x => new { x.request_id, x.lead_id });
                    table.ForeignKey(
                        name: "FK_lead_request_allocations_lead_requests_request_id",
                        column: x => x.request_id,
                        principalTable: "lead_requests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_lead_request_allocations_leads_lead_id",
                        column: x => x.lead_id,
                        principalTable: "leads",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "client_notes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    client_id = table.Column<Guid>(type: "uuid", nullable: false),
                    author_id = table.Column<Guid>(type: "uuid", nullable: true),
                    author_name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    author_role = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    response = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    text = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    version = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_client_notes", x => x.id);
                    table.ForeignKey(
                        name: "FK_client_notes_clients_client_id",
                        column: x => x.client_id,
                        principalTable: "clients",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "client_subscriptions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    client_id = table.Column<Guid>(type: "uuid", nullable: false),
                    service_name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    service_category = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    start_date = table.Column<DateOnly>(type: "date", nullable: false),
                    end_date = table.Column<DateOnly>(type: "date", nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    invoice_no = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: true),
                    paid_amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    advisor_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    version = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_client_subscriptions", x => x.id);
                    table.CheckConstraint("ck_client_subscriptions_dates", "end_date >= start_date");
                    table.ForeignKey(
                        name: "FK_client_subscriptions_clients_client_id",
                        column: x => x.client_id,
                        principalTable: "clients",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "client_trials",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    client_id = table.Column<Guid>(type: "uuid", nullable: false),
                    product = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    start_date = table.Column<DateOnly>(type: "date", nullable: false),
                    end_date = table.Column<DateOnly>(type: "date", nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    version = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_client_trials", x => x.id);
                    table.CheckConstraint("ck_client_trials_dates", "end_date >= start_date");
                    table.ForeignKey(
                        name: "FK_client_trials_clients_client_id",
                        column: x => x.client_id,
                        principalTable: "clients",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_client_notes_client_id",
                table: "client_notes",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "IX_client_subscriptions_client_id",
                table: "client_subscriptions",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "IX_client_trials_client_id",
                table: "client_trials",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "IX_clients_client_code",
                table: "clients",
                column: "client_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_clients_email",
                table: "clients",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_clients_lead_id",
                table: "clients",
                column: "lead_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_clients_manager_id",
                table: "clients",
                column: "manager_id");

            migrationBuilder.CreateIndex(
                name: "IX_clients_owner_id",
                table: "clients",
                column: "owner_id");

            migrationBuilder.CreateIndex(
                name: "IX_clients_phone",
                table: "clients",
                column: "phone",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_clients_team_leader_id",
                table: "clients",
                column: "team_leader_id");

            migrationBuilder.CreateIndex(
                name: "IX_dnd_numbers_phone",
                table: "dnd_numbers",
                column: "phone",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_lead_activities_lead_id",
                table: "lead_activities",
                column: "lead_id");

            migrationBuilder.CreateIndex(
                name: "IX_lead_assignments_lead_id",
                table: "lead_assignments",
                column: "lead_id");

            migrationBuilder.CreateIndex(
                name: "IX_lead_followups_lead_id_status",
                table: "lead_followups",
                columns: new[] { "lead_id", "status" });

            migrationBuilder.CreateIndex(
                name: "IX_lead_followups_status_due_at",
                table: "lead_followups",
                columns: new[] { "status", "due_at" });

            migrationBuilder.CreateIndex(
                name: "IX_lead_request_allocations_lead_id",
                table: "lead_request_allocations",
                column: "lead_id");

            migrationBuilder.CreateIndex(
                name: "IX_lead_request_events_request_id",
                table: "lead_request_events",
                column: "request_id");

            migrationBuilder.CreateIndex(
                name: "IX_lead_requests_manager_id",
                table: "lead_requests",
                column: "manager_id");

            migrationBuilder.CreateIndex(
                name: "IX_lead_requests_owner_id_status",
                table: "lead_requests",
                columns: new[] { "owner_id", "status" });

            migrationBuilder.CreateIndex(
                name: "IX_lead_requests_team_leader_id",
                table: "lead_requests",
                column: "team_leader_id");

            migrationBuilder.CreateIndex(
                name: "IX_leads_email",
                table: "leads",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_leads_manager_id",
                table: "leads",
                column: "manager_id");

            migrationBuilder.CreateIndex(
                name: "IX_leads_next_follow_up_at",
                table: "leads",
                column: "next_follow_up_at");

            migrationBuilder.CreateIndex(
                name: "IX_leads_owner_id",
                table: "leads",
                column: "owner_id");

            migrationBuilder.CreateIndex(
                name: "IX_leads_owner_id_status",
                table: "leads",
                columns: new[] { "owner_id", "status" });

            migrationBuilder.CreateIndex(
                name: "IX_leads_phone",
                table: "leads",
                column: "phone",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_leads_team_leader_id",
                table: "leads",
                column: "team_leader_id");

            migrationBuilder.CreateIndex(
                name: "IX_notifications_user_id_is_read",
                table: "notifications",
                columns: new[] { "user_id", "is_read" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "client_notes");

            migrationBuilder.DropTable(
                name: "client_subscriptions");

            migrationBuilder.DropTable(
                name: "client_trials");

            migrationBuilder.DropTable(
                name: "dnd_numbers");

            migrationBuilder.DropTable(
                name: "import_batches");

            migrationBuilder.DropTable(
                name: "lead_activities");

            migrationBuilder.DropTable(
                name: "lead_assignments");

            migrationBuilder.DropTable(
                name: "lead_followups");

            migrationBuilder.DropTable(
                name: "lead_request_allocations");

            migrationBuilder.DropTable(
                name: "lead_request_events");

            migrationBuilder.DropTable(
                name: "notifications");

            migrationBuilder.DropTable(
                name: "clients");

            migrationBuilder.DropTable(
                name: "lead_requests");

            migrationBuilder.DropTable(
                name: "leads");
        }
    }
}
