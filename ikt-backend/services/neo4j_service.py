from neo4j import GraphDatabase
from config import NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD

# Safe Neo4j driver initialization
driver = None

try:
    # Test connection with a short connection timeout
    driver = GraphDatabase.driver(
        NEO4J_URI, 
        auth=(NEO4J_USER, NEO4J_PASSWORD),
        connection_timeout=3.0
    )
    # Run a test query to verify credentials and connection
    with driver.session() as session:
        session.run("RETURN 1")
    print("Successfully connected to Neo4j Graph Database.")
except Exception as e:
    driver = None
    print(f"Neo4j client failed to initialize: {e}. Graph DB relationships will use SQLite fallbacks.")

def build_knowledge_graph_nodes(doc_id: str, doc_name: str, entities: dict):
    if not driver:
        print("Neo4j Graph Database integration is offline. Skipping Cypher relationship creation.")
        return

    try:
        with driver.session() as session:
            # 1. Create Document Node
            session.run(
                "MERGE (d:Document {id: $doc_id}) SET d.name = $doc_name",
                doc_id=doc_id, doc_name=doc_name
            )

            # Extract list values safely
            assets = entities.get("assets", [])
            engineers = entities.get("engineers", [])
            procedures = entities.get("procedures", [])
            compliance = entities.get("compliance", [])
            failures = entities.get("failures", [])

            # 2. Iterate and merge assets
            for asset_name in assets:
                session.run("MERGE (a:Asset {name: $name})", name=asset_name)
                session.run(
                    "MATCH (d:Document {id: $doc_id}), (a:Asset {name: $asset_name}) "
                    "MERGE (d)-[:REFERENCES]->(a)",
                    doc_id=doc_id, asset_name=asset_name
                )

                # Link Engineers
                for eng_name in engineers:
                    session.run("MERGE (e:Engineer {name: $name})", name=eng_name)
                    session.run(
                        "MATCH (a:Asset {name: $asset_name}), (e:Engineer {name: $eng_name}) "
                        "MERGE (a)-[:MAINTAINED_BY]->(e)",
                        asset_name=asset_name, eng_name=eng_name
                    )

                # Link Failures
                for fail_name in failures:
                    session.run("MERGE (f:Failure {name: $name})", name=fail_name)
                    session.run(
                        "MATCH (a:Asset {name: $asset_name}), (f:Failure {name: $fail_name}) "
                        "MERGE (a)-[:HAS_FAILURE]->(f)",
                        asset_name=asset_name, fail_name=fail_name
                    )

                # Link Procedures
                for proc_name in procedures:
                    session.run("MERGE (p:Procedure {name: $name})", name=proc_name)
                    session.run(
                        "MATCH (a:Asset {name: $asset_name}), (p:Procedure {name: $proc_name}) "
                        "MERGE (a)-[:USES_PROCEDURE]->(p)",
                        asset_name=asset_name, proc_name=proc_name
                    )

                    # Link Procedures to Compliance Rules
                    for comp_name in compliance:
                        session.run("MERGE (c:ComplianceRule {name: $name})", name=comp_name)
                        session.run(
                            "MATCH (p:Procedure {name: $proc_name}), (c:ComplianceRule {name: $comp_name}) "
                            "MERGE (p)-[:RELATED_TO]->(c)",
                            proc_name=proc_name, comp_name=comp_name
                        )
                        
        print(f"Successfully generated Neo4j nodes and edges for {doc_name}.")
    except Exception as e:
        print(f"Failed to generate Neo4j relations: {e}")

def close_graph_driver():
    if driver:
        driver.close()
