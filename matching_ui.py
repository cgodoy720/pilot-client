#!/usr/bin/env python3
"""
Web-based UI for matching Sage Intacct invoices to Salesforce opportunities.
Provides an interactive interface to review, match, and save links.
"""

from flask import Flask, render_template, jsonify, request
import csv
import json
import os
from datetime import datetime

app = Flask(__name__)

# Store matches in memory and save to file
MATCHES_FILE = 'invoice_opportunity_matches.json'
INVOICES_CSV = 'nonprofit_grant_invoices.csv'


def load_invoices():
    """Load invoices from CSV."""
    invoices = []
    if os.path.exists(INVOICES_CSV):
        with open(INVOICES_CSV, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                invoices.append(row)
    return invoices


def load_matches():
    """Load saved matches from JSON file."""
    if os.path.exists(MATCHES_FILE):
        with open(MATCHES_FILE, 'r') as f:
            return json.load(f)
    return {}


def save_matches(matches):
    """Save matches to JSON file."""
    with open(MATCHES_FILE, 'w') as f:
        json.dump(matches, f, indent=2)


@app.route('/')
def index():
    """Main matching UI page."""
    invoices = load_invoices()
    matches = load_matches()
    
    # Add match status to each invoice
    for inv in invoices:
        record_no = inv['invoice_id']
        if record_no in matches:
            inv['matched'] = True
            inv['opportunity_id'] = matches[record_no].get('opportunity_id', '')
            inv['match_confidence'] = matches[record_no].get('confidence', '')
            inv['notes'] = matches[record_no].get('notes', '')
        else:
            inv['matched'] = False
            inv['opportunity_id'] = ''
            inv['match_confidence'] = ''
            inv['notes'] = ''
    
    stats = {
        'total': len(invoices),
        'matched': len(matches),
        'unmatched': len(invoices) - len(matches),
        'total_amount': sum(float(inv.get('amount', 0)) 
                           for inv in invoices),
        'matched_amount': sum(float(inv.get('amount', 0)) 
                             for inv in invoices 
                             if inv.get('matched', False))
    }
    
    return render_template('matching.html', invoices=invoices, stats=stats)


@app.route('/api/save_match', methods=['POST'])
def save_match():
    """Save a match between invoice and opportunity."""
    data = request.json
    
    invoice_record_no = data.get('invoice_record_no')
    opportunity_id = data.get('opportunity_id', '')
    confidence = data.get('confidence', 'manual')
    notes = data.get('notes', '')
    
    matches = load_matches()
    
    matches[invoice_record_no] = {
        'opportunity_id': opportunity_id,
        'confidence': confidence,
        'notes': notes,
        'matched_at': datetime.now().isoformat(),
        'invoice_data': {
            'customer_name': data.get('customer_name', ''),
            'invoice_amount': data.get('invoice_amount', ''),
            'invoice_date': data.get('invoice_date', ''),
        }
    }
    
    save_matches(matches)
    
    return jsonify({'success': True, 'message': 'Match saved successfully'})


@app.route('/api/delete_match', methods=['POST'])
def delete_match():
    """Delete a match."""
    data = request.json
    invoice_record_no = data.get('invoice_record_no')
    
    matches = load_matches()
    if invoice_record_no in matches:
        del matches[invoice_record_no]
        save_matches(matches)
        return jsonify({'success': True, 'message': 'Match deleted'})
    
    return jsonify({'success': False, 'message': 'Match not found'})


@app.route('/api/export_matches')
def export_matches():
    """Export matches to CSV."""
    matches = load_matches()
    invoices = load_invoices()
    
    # Create export data
    export_data = []
    for inv in invoices:
        record_no = inv['invoice_id']
        match = matches.get(record_no, {})
        
        export_data.append({
            'invoice_id': record_no,
            'invoice_number': inv.get('invoice_number', ''),
            'customer_name': inv.get('customer_name', ''),
            'customer_type': inv.get('customer_type', ''),
            'amount': inv.get('amount', 0),
            'due_amount': inv.get('due_amount', 0),
            'invoice_date': inv.get('invoice_date', ''),
            'due_date': inv.get('due_date', ''),
            'salesforce_opportunity_id': match.get('opportunity_id', ''),
            'match_confidence': match.get('confidence', ''),
            'notes': match.get('notes', ''),
            'matched_at': match.get('matched_at', '')
        })
    
    # Write to CSV
    export_file = f'matched_invoices_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
    with open(export_file, 'w', newline='', encoding='utf-8') as f:
        if export_data:
            writer = csv.DictWriter(f, fieldnames=export_data[0].keys())
            writer.writeheader()
            writer.writerows(export_data)
    
    return jsonify({
        'success': True,
        'filename': export_file,
        'count': len([m for m in matches if matches[m].get('opportunity_id')])
    })


if __name__ == '__main__':
    # Create templates directory
    os.makedirs('templates', exist_ok=True)
    
    # Check if invoices file exists
    if not os.path.exists(INVOICES_CSV):
        print(f"ERROR: {INVOICES_CSV} not found!")
        print("Please run: python find_all_grants.py first")
        exit(1)
    
    print("\n" + "=" * 80)
    print("  INVOICE ↔ OPPORTUNITY MATCHING UI")
    print("=" * 80)
    print(f"\n✅ Loaded {len(load_invoices())} invoices")
    print(f"✅ Loaded {len(load_matches())} existing matches")
    print("\n🌐 Starting web server...")
    print("\n📱 Open your browser to: http://localhost:5000")
    print("\n⚠️  Press Ctrl+C to stop the server\n")
    
    app.run(debug=True, port=5000)

